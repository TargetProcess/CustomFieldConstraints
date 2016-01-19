import Validity from './Validity';

export default class ValueValidity extends Validity {

    constructor(inVertexValues) {
        super();
        this._inVertexValues = inVertexValues;
    }

    _hasValue(value) {
        for (var i = 0, len = this._inVertexValues.length; i < len; i++) {
            var inValue = this._inVertexValues[i];
            if ((!inValue && !value) || (inValue === value)) {
                return true;
            }
        }
        return false;
    }
}
