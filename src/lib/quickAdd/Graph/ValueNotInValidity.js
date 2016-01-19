import ValueValidity from './ValueValidity';

export default class ValueNotInValidity extends ValueValidity {

    isValid(edge) {
        return super.isValid(edge) && !this._hasValue(edge.getInVertex().getValue());
    }

}
