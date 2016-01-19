import _ from 'underscore';

export default class Vertex {
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
        return Boolean(_.find(this._inEdges, function(inEdge) {
            return inEdge.isValid();
        }));
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
