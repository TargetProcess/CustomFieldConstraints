var _ = require('underscore');

class CFConstraintsGraph {
    constructor(cfs, cfConstraintsConfig, defaultValues, onVertexIsValidChangeCallback) {
        this._cfConstraintsConfig = cfConstraintsConfig;
        this._onVertexIsValidChangeCallback = onVertexIsValidChangeCallback;
        this._defaultValues = defaultValues;
        this._verticesWrapped = this._buildGraph(cfs);
    }

    getVerticesWrapped() {
        return this._verticesWrapped;
    }

    setCFValue(processId, entityTypeName, cfName, cfValue) {
        if (!this._verticesWrapped.processes[processId] || !this._verticesWrapped.processes[processId].entityTypes[entityTypeName]) {
            return;
        }

        var vertexToUpdate = this._verticesWrapped.processes[processId].entityTypes[entityTypeName].cfs[cfName];
        if (!vertexToUpdate) {
            return;
        }

        vertexToUpdate.setValue(cfValue);
        this._breadthFirstUpdateVertexValidity(vertexToUpdate);
    }

    _buildGraph(cfs) {
        var cfsTree = this._buildCFsTree(cfs),
            verticesWrapped = {
                processes: {}
            };
        for (var processId in cfsTree) {
            //noinspection JSUnfilteredForInLoop
            verticesWrapped.processes[processId] = this._buildProcessVertexWrapped(cfsTree, processId, _.bind(this._onVertexIsValidChangeCallback, this, processId));
        }
        return verticesWrapped;
    }

    _buildCFsTree(cfs) {
        return _.reduce(cfs, function(cfsTreeMemo, cf) {
            var entityTypeNameLowered = cf.entityTypeName.toLowerCase();
            cfsTreeMemo[cf.processId] = cfsTreeMemo[cf.processId] || {};
            cfsTreeMemo[cf.processId][entityTypeNameLowered] = cfsTreeMemo[cf.processId][entityTypeNameLowered] || {};
            cfsTreeMemo[cf.processId][entityTypeNameLowered][cf.name] = cf;
            return cfsTreeMemo;
        }, {});
    }

    _buildProcessVertexWrapped(cfsTree, processId, onIsValidChangeCallback) {
        var processVertexWrapped = {
                vertex: new CFConstraintsGraphVertex(processId, true),
                entityTypes: {}
            },
            processConstraintRule = _.find(this._cfConstraintsConfig, function(processConstraintRule) {
                return processConstraintRule.processId == processId;
            });

        var cfsSubTree = cfsTree[processId];
        for (var entityTypeName in cfsSubTree) {
            //noinspection JSUnfilteredForInLoop
            var entityTypeConstraintRule = processConstraintRule ? processConstraintRule.constraints[entityTypeName.toLowerCase()] : null,
                entityTypeVertexWrapped = this._buildEntityTypeVertexWrapped(cfsSubTree, entityTypeName, entityTypeConstraintRule, _.bind(onIsValidChangeCallback, this, entityTypeName)),
                edge = new CFConstraintsGraphEdge(processVertexWrapped.vertex, entityTypeVertexWrapped.vertex, new CFConstraintsGraphEdgeValidityConstraintByInVertexValidity());
            //noinspection JSUnfilteredForInLoop
            processVertexWrapped.entityTypes[entityTypeName] = entityTypeVertexWrapped;
            processVertexWrapped.vertex.getOutEdges().push(edge);
            entityTypeVertexWrapped.vertex.getInEdges().push(edge);
        }

        return processVertexWrapped;
    }

    _buildEntityTypeVertexWrapped(cfsTree, entityTypeName, entityTypeConstraintRule, onIsValidChangeCallback) {
        var entityTypeVertexWrapped = {
                vertex: new CFConstraintsGraphVertex(entityTypeName, true),
                cfs: {}
            },
            cfConstraints = entityTypeConstraintRule
                ? entityTypeConstraintRule['customFields'] || []
                : [];
        var cfsSubTree = cfsTree[entityTypeName],
            rootCFVertices = {};

        for (var cfName in cfsSubTree) {
            //noinspection JSUnfilteredForInLoop
            var rootCFVertex = this._buildRootCFVertex(cfsSubTree[cfName], onIsValidChangeCallback)
            var edge = new CFConstraintsGraphEdge(entityTypeVertexWrapped.vertex, rootCFVertex, new CFConstraintsGraphEdgeValidityConstraintByInVertexValidity());

            rootCFVertices[rootCFVertex.getId()] = rootCFVertex;
            entityTypeVertexWrapped.vertex.getOutEdges().push(edge);
            rootCFVertex.getInEdges().push(edge);
        }
        entityTypeVertexWrapped.cfs = this._buildCFVertices(rootCFVertices, cfConstraints, onIsValidChangeCallback);
        return entityTypeVertexWrapped;
    }

    _buildRootCFVertex(cf, onIsValidChangeCallback) {
        return new CFConstraintsGraphValueVertex(cf.name, true, onIsValidChangeCallback, cf.config.defaultValue);
    }

    _buildCFVertices(rootCFVertices, cfConstraints, onIsValidChangeCallback) {
        var vertices = _.extend({}, rootCFVertices);

        if (_.isEmpty(vertices)) {
            return vertices;
        }

        var vertexIdQueue = _.map(vertices, function(vertex) {
                return vertex.getId();
            }),
            inVertexId = vertexIdQueue.shift(),
            outVertexId;

        while (inVertexId) {
            var vertexConstraints = this._getVertexConstraintsFiltered(cfConstraints, inVertexId);
            var inVertex = vertices[inVertexId];
            _.forEach(vertexConstraints, function(vertexConstraint) {
                _.forEach(vertexConstraint.requiredCustomFields, function(requiredCustomField) {
                    var outVertex = this._getOrCreateOutVertex(vertices, requiredCustomField, onIsValidChangeCallback),
                        edgeValidityConstraint = this._createEdgeValidityConstraint(vertexConstraint),
                        edge = new CFConstraintsGraphEdge(inVertex, outVertex, edgeValidityConstraint);
                    this._ensureOutVertexActualValidity(outVertex, edge);
                    inVertex.getOutEdges().push(edge);
                    outVertex.getInEdges().push(edge);
                    outVertexId = outVertex.getId();
                    if (!vertices[outVertexId]) {
                        vertices[outVertexId] = outVertex;
                        vertexIdQueue.push(outVertexId);
                    }
                }, this)
            }, this);
            inVertexId = vertexIdQueue.shift();
        }

        return vertices;
    }

    _getVertexConstraintsFiltered(cfConstraints, vertexId) {
        return _.filter(cfConstraints, _.bind(function(cfName, cfConstraint) {
            return cfConstraint.name.toLowerCase() === cfName.toLowerCase();
        }, this, vertexId));
    }

    _getOrCreateOutVertex(vertices, requiredCustomField, onIsValidChangeCallback) {
        var defaultValue = this._defaultValues[requiredCustomField] || null;
        return vertices[requiredCustomField] || new CFConstraintsGraphValueVertex(requiredCustomField, false, onIsValidChangeCallback, defaultValue);
    }

    _createEdgeValidityConstraint(vertexConstraint) {
        return vertexConstraint.valueIn
            ? new CFConstraintsGraphEdgeValidityConstraintByVertexValidityAndInVertexValueIn(vertexConstraint.valueIn)
            : new CFConstraintsGraphEdgeValidityConstraintByVertexValidityAndInVertexValueNotIn(vertexConstraint.valueNotIn);
    }

    _ensureOutVertexActualValidity(outVertex, edge) {
        if (!outVertex.isValid() && edge.isValid()) {
            outVertex.setIsValid(true);
        }
    }

    _breadthFirstUpdateVertexValidity(vertex) {
        var edgesToUpdateQueue = vertex.getOutEdges().slice();
        if (edgesToUpdateQueue.length === 0) {
            return;
        }
        var edge = edgesToUpdateQueue.shift(),
            outVertex,
            outVertexId,
            visitedVertices = {},
            isValid,
            isValidByEdges;

        visitedVertices[vertex.getId()] = vertex;

        while (edge) {
            outVertex = edge.getOutVertex();
            outVertexId = outVertex.getId();
            if (!visitedVertices[outVertexId]) {
                visitedVertices[outVertexId] = outVertex;
                isValid = outVertex.isValid();
                isValidByEdges = outVertex.isValidByEdges();
                if (isValid !== isValidByEdges) {
                    outVertex.setIsValid(isValidByEdges);
                    Array.prototype.push.apply(edgesToUpdateQueue, outVertex.getOutEdges());
                }
            }
            edge = edgesToUpdateQueue.shift();
        }
    }
}

class CFConstraintsGraphVertex {
    constructor(id, isValid) {
        this._id = id;
        this._isValid = isValid;
        this._inEdges = [];
        this._outEdges = [];
    }

    getId() {
        return this._id;
    }

    isValid() {
        return this._isValid;
    }

    isValidByEdges() {
        return !!_.find(this._inEdges, function(inEdge) {
            return inEdge.isValid();
        });
    }

    setIsValid(isValid) {
        this._isValid = isValid;
    }

    getInEdges() {
        return this._inEdges;
    }

    getOutEdges() {
        return this._outEdges;
    }
}

class CFConstraintsGraphValueVertex extends CFConstraintsGraphVertex {
    constructor(id, isValid, onIsValidChangeCallback, value) {
        super(id, isValid, onIsValidChangeCallback);
        this._onIsValidChange = onIsValidChangeCallback;
        this._value = value;

    }
    setIsValid(isValid) {
        super.setIsValid(isValid);
        this._onIsValidChange({
            id: this._id,
            isValid: this._isValid,
            value: this._value
        });
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        this._value = value;
    }
}

class CFConstraintsGraphEdge {
    constructor(inVertex, outVertex, validityConstraint) {
        this._inVertex = inVertex;
        this._outWertex = outVertex;
        this._validityConstraint = validityConstraint;
    }

    getInVertex() {
        return this._inVertex;
    }

    getOutVertex() {
        return this._outWertex;
    }

    isValid() {
        return this._validityConstraint.isValid(this);
    }
}

class CFConstraintsGraphEdgeValidityConstraintByInVertexValidity {
    isValid(edge) {
        return edge.getInVertex().isValid();
    }
}

class CFConstraintsGraphEdgeValidityConstraintByVertexValidityAndInVertexValue extends CFConstraintsGraphEdgeValidityConstraintByInVertexValidity {
    constructor(inVertexValues) {
        super();
        this._inVertexValues = inVertexValues;
    }

    _hasValue(value) {
        for (var i = 0, len = this._inVertexValues.length; i < len; i++) {
            var inValue = this._inVertexValues[i];
            if ((!inValue && !value) || (inValue == value)) {
                return true;
            }
        }
        return false;
    }
}

class CFConstraintsGraphEdgeValidityConstraintByVertexValidityAndInVertexValueIn extends CFConstraintsGraphEdgeValidityConstraintByVertexValidityAndInVertexValue {
    constructor(inVertexValuesIn) {
        super(inVertexValuesIn);
    }

    isValid(edge) {
        return super.isValid(edge) && this._hasValue(edge.getInVertex().getValue());
    }
}

class CFConstraintsGraphEdgeValidityConstraintByVertexValidityAndInVertexValueNotIn extends CFConstraintsGraphEdgeValidityConstraintByVertexValidityAndInVertexValue {
    constructor(inVertexValuesNotIn) {
        super(inVertexValuesNotIn);
    }

    isValid(edge) {
        return super.isValid(edge) && !this._hasValue(edge.getInVertex().getValue());
    }
}

module.exports = CFConstraintsGraph;
