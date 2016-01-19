import Vertex from './Vertex';

export default class ValueVertex extends Vertex {
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
