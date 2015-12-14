import React, {findDOMNode} from 'react';
import $ from 'jquery';
import cx from 'classnames';

export default class InputMultidropdown extends React.Component {

    static defaultProps = {
        value: []
    }

    render() {

        const {field, value} = this.props;
        const options = field.value;

        return (
            <select
                {...this.props}
                className={cx('tau-select', {'tau-error': this.props.isInvalid})}
                multiple={true}
                onFocus={this.handleFocus}
                ref="input"
                type="text"
                value={value}
            >
                {options.map((v, k) => (
                    <option key={k} value={v}>{v}</option>
                ))}
            </select>
        );

    }

    handleFocus = (e) => {

        // prevent when async blur from another input calls re-render and this
        // input has no value even some option was selected on focus before
        setTimeout(() => this.props.onChange(e), 0);

    }

    get value() {

        return $(findDOMNode(this.refs.input)).val() || [];

    }

}
