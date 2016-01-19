import _ from 'underscore';

import Edge from './Edge';
import Vertex from './Vertex';
import ValueVertex from './ValueVertex';
import ValueInValidity from './ValueInValidity';
import ValueNotInValidity from './ValueNotInValidity';

export default class CFConstraintsGraph {
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
                vertex: new Vertex(processId, true),
                entityTypes: {}
            },
            processConstraintRule = _.find(this._cfConstraintsConfig, function(v) {
                return v.processId === processId;
            });

        var cfsSubTree = cfsTree[processId];
        for (var entityTypeName in cfsSubTree) {

            var entityTypeConstraintRule = processConstraintRule ? processConstraintRule.constraints[entityTypeName.toLowerCase()] : null,
                entityTypeVertexWrapped = this._buildEntityTypeVertexWrapped(cfsSubTree, entityTypeName, entityTypeConstraintRule, _.bind(onIsValidChangeCallback, this, entityTypeName)),
                edge = new Edge(processVertexWrapped.vertex, entityTypeVertexWrapped.vertex, new ValueInValidity());

            processVertexWrapped.entityTypes[entityTypeName] = entityTypeVertexWrapped;
            processVertexWrapped.vertex.getOutEdges().push(edge);
            entityTypeVertexWrapped.vertex.getInEdges().push(edge);
        }

        return processVertexWrapped;
    }

    _buildEntityTypeVertexWrapped(cfsTree, entityTypeName, entityTypeConstraintRule, onIsValidChangeCallback) {
        var entityTypeVertexWrapped = {
                vertex: new Vertex(entityTypeName, true),
                cfs: {}
            },
            cfConstraints = entityTypeConstraintRule
                ? entityTypeConstraintRule.customFields || []
                : [];
        var cfsSubTree = cfsTree[entityTypeName],
            rootCFVertices = {};

        for (var cfName in cfsSubTree) {

            var rootCFVertex = this._buildRootCFVertex(cfsSubTree[cfName], onIsValidChangeCallback);
            var edge = new Edge(entityTypeVertexWrapped.vertex, rootCFVertex, new ValueInValidity());

            rootCFVertices[rootCFVertex.getId()] = rootCFVertex;
            entityTypeVertexWrapped.vertex.getOutEdges().push(edge);
            rootCFVertex.getInEdges().push(edge);
        }
        entityTypeVertexWrapped.cfs = this._buildCFVertices(rootCFVertices, cfConstraints, onIsValidChangeCallback);
        return entityTypeVertexWrapped;
    }

    _buildRootCFVertex(cf, onIsValidChangeCallback) {
        return new ValueVertex(cf.name, true, onIsValidChangeCallback, cf.config.defaultValue);
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
                        edge = new Edge(inVertex, outVertex, edgeValidityConstraint);
                    this._ensureOutVertexActualValidity(outVertex, edge);
                    inVertex.getOutEdges().push(edge);
                    outVertex.getInEdges().push(edge);
                    outVertexId = outVertex.getId();
                    if (!vertices[outVertexId]) {
                        vertices[outVertexId] = outVertex;
                        vertexIdQueue.push(outVertexId);
                    }
                }, this);
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
        return vertices[requiredCustomField] || new ValueVertex(requiredCustomField, false, onIsValidChangeCallback, defaultValue);
    }

    _createEdgeValidityConstraint(vertexConstraint) {
        return vertexConstraint.valueIn
            ? new ValueInValidity(vertexConstraint.valueIn)
            : new ValueNotInValidity(vertexConstraint.valueNotIn);
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
