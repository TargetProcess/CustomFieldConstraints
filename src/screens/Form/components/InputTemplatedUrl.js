import React from 'react';
import {findDOMNode} from 'react-dom';

import InputText from './InputText';

import S from './InputTemplatedUrl.css';

export default class InputTemplatedUrl extends React.Component {

    render() {

        const {field} = this.props;
        const {template} = field.config;
        const [before, after] = template.split('{0}');

        return (
            <div className={S.block}>
                {before ? <span className={S.template}>{before}</span> : null}
                <InputText {...this.props} ref="input" />
                {after ? <span className={S.template}>{after}</span> : null}
            </div>
        );

    }

    get value() {

        return findDOMNode(this.refs.input).value;

    }

}
