import React, {PropTypes as T} from 'react';
import {findDOMNode} from 'react-dom';

import cx from 'classnames';

import S from './InputCheckbox.css';

export default class InputCheckbox extends React.Component {

    static propTypes = {
        field: T.shape({
            name: T.string
        }).isRequired,
        isInvalid: T.bool,
        value: T.any
    };

    render() {

        const {field, value} = this.props;
        const {name: label} = field;

        return (
            <label className={cx('customfield-checkbox', 'checkbox-hover-trigger', S.block)}>
                <div className="customfield-checkbox__label">{label}</div>
                <div className="customfield-checkbox__value">
                    <div className={cx('toggle-switch', {'tau-error': this.props.isInvalid})}>
                        <input className="toggle-switch__input" {...this.props} checked={value} ref="input" type="checkbox" />
                        <span className="toggle-switch__slider"></span>
                    </div>
                </div>
            </label>
        );

    }

    get value() {

        return findDOMNode(this.refs.input).checked;

    }

}
