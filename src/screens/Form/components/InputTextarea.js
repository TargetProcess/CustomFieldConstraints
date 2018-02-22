import React from 'react';
import {findDOMNode} from 'react-dom';
import cx from 'classnames';

import S from './InputTextarea.css';

export default class InputTextarea extends React.Component {

    render() {

        return (
            <div className={cx(S.block, {'tau-error': this.props.isInvalid}, this.props.className)}>
                <textarea
                    placeholder=" "
                    ref="input"
                    {...this.props}
                    className={cx('tau-in-text', S.textarea, {'tau-error': this.props.isInvalid})}
                />
            </div>
        );

    }

    get value() {

        return findDOMNode(this.textarea).value;

    }

    get textarea() {

        return this.refs.input;

    }

}
