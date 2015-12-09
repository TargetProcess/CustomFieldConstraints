import React, {PropTypes as T} from 'react';
import {noop, pluck} from 'underscore';
import cx from 'classnames';

import Input from './Input';

import {block, label as labelStyle, labeltextrichtext, labeltext, sublabeltext} from './FormRow.css';

export default class FormRow extends React.Component {

    static propTypes = {
        autoFocus: T.bool,
        item: T.shape({
            name: T.string,
            field: Input.propTypes.field.isRequired,
            value: T.any
        }).isRequired,
        onChange: T.func
    }

    static defaultProps = {
        onChange: noop
    }

    render() {

        const {item, onChange, autoFocus} = this.props;
        const {name, field, hasDirtyValue, value, hasErrors, validationErrors} = item;
        const fieldType = field.type;
        let label = name;
        let sublabel;

        if (fieldType === 'checkbox') label = '';

        if (fieldType === 'money') label = `${label}, ${field.config.units}`;

        const isInvalid = hasErrors && hasDirtyValue;
        const title = isInvalid ? pluck(validationErrors, 'message').join('\n') : null;

        return (
            <div className={block} title={title}>
                <label className={labelStyle}>
                    <div className={cx(labeltext, {[labeltextrichtext]: fieldType === 'richtext'})}>
                        <span>{label}</span>
                        {sublabel ? (
                            <div className={sublabeltext}>{sublabel}</div>
                        ) : null}
                    </div>
                    <Input
                        autoFocus={autoFocus}
                        field={field}
                        isInvalid={isInvalid}
                        onChange={onChange}
                        ref="input"
                        validationErrors={validationErrors}
                        value={value}
                    />
                </label>
            </div>
        );

    }

    get value() {

        return this.refs.input.value;

    }

}
