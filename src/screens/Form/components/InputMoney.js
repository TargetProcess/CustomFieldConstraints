import $ from 'jquery';
import React from 'react';
import {findDOMNode} from 'react-dom';

import InputText from './InputText';
import {fields} from '../fields';

export default class InputMoney extends React.Component {

    componentDidMount() {

        const $input = $(findDOMNode(this.refs.input));

        $input.inputMaskEditor({
            mask: fields.money.mask
        });

    }

    render() {

        const value = fields.money.format(this.props.value);

        return (
            <InputText {...this.props} ref="input" value={value} />
        );

    }

    get value() {

        const value = findDOMNode(this.refs.input).value;

        return fields.money.invariant(value);

    }

}
