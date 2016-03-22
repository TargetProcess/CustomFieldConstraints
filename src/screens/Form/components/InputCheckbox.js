import React, {findDOMNode, PropTypes as T} from 'react';

export default class InputCheckbox extends React.Component {

    static propTypes = {
        field: T.shape({
            name: T.string
        }).isRequired,
        value: T.any
    };

    render() {

        const {field, value} = this.props;
        const {name: label} = field;

        return (
            <label className="tau-checkbox">
                <input {...this.props} checked={value} ref="input" type="checkbox" />
                <i className="tau-checkbox__icon" />
                <span style={{color: '#999'}}>{label}</span>
            </label>
        );

    }

    get value() {

        return findDOMNode(this.refs.input).checked;

    }

}
