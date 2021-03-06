import $ from 'jquery';
import React from 'react';
import {findDOMNode} from 'react-dom';

import InputText from './InputText';
import {fields} from '../fields';

export default class InputNumber extends React.Component {

    componentDidMount() {

        const $input = $(findDOMNode(this.refs.input));

        $input.inputMaskEditor({
            mask: fields.number.mask
        });

    }

    render() {

        const value = fields.number.format(this.props.value);

        return (
            <InputText {...this.props} ref="input" value={value} />
        );

    }

    get value() {

        const value = findDOMNode(this.refs.input).value;

        return fields.number.invariant(value);

    }

}
