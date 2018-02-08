import React from 'react';
import {findDOMNode} from 'react-dom';
import cx from 'classnames';

export default class InputDropdown extends React.Component {

    render() {

        const {field, value} = this.props;
        const options = [''].concat(field.config.options);

        return (
            <select
                {...this.props}
                className={cx('tau-select', {'tau-error': this.props.isInvalid})}
                ref="input"
                value={value}
            >
                {options.map((v, k) => (
                    <option key={k} value={v}>{v}</option>
                ))}
            </select>
        );

    }

    get value() {

        return findDOMNode(this.refs.input).value;

    }

}
