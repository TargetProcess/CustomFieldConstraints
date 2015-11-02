import React, {findDOMNode} from 'react';

import InputText from './InputText';

import {block, template as templateStyle} from './InputTemplatedUrl.css';

export default class InputTemplatedUrl extends React.Component {

    render() {

        const {field} = this.props;
        const {value: template} = field;
        const [before, after] = template.split('{0}');

        return (
            <div className={block}>
                {before ? <span className={templateStyle}>{before}</span> : null}
                <InputText {...this.props} ref="input" />
                {after ? <span className={templateStyle}>{after}</span> : null}
            </div>
        );

    }

    get value() {

        return findDOMNode(this.refs.input).value;

    }

}
