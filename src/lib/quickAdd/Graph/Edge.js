export default class CFConstraintsGraphEdge {

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
