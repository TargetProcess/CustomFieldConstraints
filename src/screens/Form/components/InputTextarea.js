import React, {findDOMNode} from 'react';
import cx from 'classnames';

import {block, textarea} from './InputTextarea.css';

export default class InputTextarea extends React.Component {

    render() {

        return (
            <div className={cx(block, {'tau-error': this.props.isInvalid}, this.props.className)}>
                <textarea
                    placeholder=" "
                    ref="input"
                    {...this.props}
                    className={cx('tau-in-text', textarea, {'tau-error': this.props.isInvalid})}
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
