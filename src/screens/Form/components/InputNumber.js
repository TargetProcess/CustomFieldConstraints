import React, {findDOMNode} from 'react';

import InputText from './InputText';

export default class InputNumber extends React.Component {

    render() {

        return (
            <InputText type="number" {...this.props} ref="input" />
        );

    }

    get value() {

        return findDOMNode(this.refs.input).value;

    }

}
