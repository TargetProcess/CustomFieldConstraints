import React, {PropTypes as T} from 'react';
import {noop, pluck, uniqueId} from 'underscore';
import cx from 'classnames';

import Input from './Input';

import S from './FormRow.css';

export default class FormRow extends React.Component {

    static propTypes = {
        autoFocus: T.bool,
        entity: T.object,
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

        const {entity, item, onChange, autoFocus} = this.props;
        const {name, field, hasDirtyValue, value, hasErrors, validationErrors} = item;
        const fieldType = field.type;
        let label = name;
        let specificProps = {};

        if (fieldType === 'checkbox') label = '';

        if (fieldType === 'money') label = `${label}, ${field.config.units}`;

        if (fieldType === 'entity') {

            specificProps = {
                filterEntityTypeName: entity.entityType.name.toLowerCase(),
                filterFields: (entity.project && entity.project.id) ? {
                    'project.id': entity.project.id
                } : {}
            };

        }

        const isInvalid = hasErrors && hasDirtyValue;
        const title = isInvalid ? pluck(validationErrors, 'message').join('\n') : null;
        const id = uniqueId('formrow');

        return (
            <div className={S.block} title={title}>
                <div className={S.label}>
                    <label className={cx(S.labeltext, {[S.labeltextrichtext]: fieldType === 'richtext'})} htmlFor={id}>
                        <span>{label}</span>
                    </label>
                    <Input
                        {...specificProps}
                        autoFocus={autoFocus}
                        field={field}
                        id={id}
                        isInvalid={isInvalid}
                        onChange={onChange}
                        ref="input"
                        validationErrors={validationErrors}
                        value={value}
                    />
                </div>
            </div>
        );

    }

    get value() {

        return this.refs.input.value;

    }

}
