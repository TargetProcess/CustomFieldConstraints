import React from 'react';
import {findDOMNode} from 'react-dom';
import $ from 'jquery';
import cx from 'classnames';

import dateUtils from 'tau/utils/utils.date';

import S from './InputDate.css';

export default class InputDate extends React.Component {

    componentDidMount() {

        const $trigger = $(findDOMNode(this.refs.trigger));
        const $input = $(findDOMNode(this.refs.input));

        $.datepicker.parseDate = (format, value) => dateUtils.parse(value);
        $.datepicker.formatDate = (format, date) => dateUtils.formatAs(date, format);

        $input.datepicker({
            dateFormat: dateUtils.getFormatData().date.short,
            onSelect: this.props.onChange
        });

        $trigger.on('click', () => $input.datepicker('show'));

    }

    render() {

        return (
            <div className={cx('ui-dateeditor', S.block)}>
                <input
                    {...this.props}
                    className={cx('tau-in-text', {'tau-error': this.props.isInvalid})}
                    placeholder=" "
                    ref="input"
                    type="text"
                    value={this.props.value}
                />
                <span className="ui-datepicker-trigger" ref="trigger" />
            </div>
        );

    }

    get value() {

        return findDOMNode(this.refs.input).value;

    }

}
