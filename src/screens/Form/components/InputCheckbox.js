import React, {findDOMNode} from 'react';

export default class InputCheckbox extends React.Component {

    render() {

        const {name: label} = this.props.field;

        return (
            <label className="tau-checkbox">
                <input {...this.props} checked={this.props.value} ref="input" type="checkbox" />
                <i className="tau-checkbox__icon" />
                <span style={{color: '#999'}}>{label}</span>
            </label>
        );

    }

    get value() {

        return findDOMNode(this.refs.input).checked;

    }

}
