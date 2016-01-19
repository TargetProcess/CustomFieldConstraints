import ValueValidity from './ValueValidity';

export default class ValueInValidity extends ValueValidity {

    isValid(edge) {
        return super.isValid(edge) && this._hasValue(edge.getInVertex().getValue());
    }

}
