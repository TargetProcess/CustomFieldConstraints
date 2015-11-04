import React, {PropTypes as T} from 'react';
import {noop, pluck} from 'underscore';

import Input from './Input';
import styles from './FormRow.css';

export default class FormRow extends React.Component {

    static propTypes = {
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

        const {item, onChange} = this.props;
        const {name, field, hasDirtyValue, value, hasErrors, validationErrors} = item;
        const fieldType = field.type;
        let label = name;
        let sublabel;

        if (fieldType === 'checkbox') {

            label = '';

        }

        if (fieldType === 'money') {

            label = `${label}, ${field.config.units}`;

        }

        if (fieldType === 'richtext') {

            sublabel = 'You can use markdow here';

        }

        const title = hasErrors ? pluck(validationErrors, 'message').join('\n') : null;

        return (
            <div className={styles.block} title={title}>
                <label className={styles.label}>
                    <div className={styles.labeltext}>
                        <span>{label}</span>
                        {sublabel ? (
                            <div className={styles.sublabeltext}>{sublabel}</div>
                        ) : null}
                    </div>
                    <Input
                        field={field}
                        isInvalid={hasErrors && hasDirtyValue}
                        onChange={onChange} ref="input"
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
