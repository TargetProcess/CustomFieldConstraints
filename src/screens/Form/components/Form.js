import React, {PropTypes as T} from 'react';

import FormRow from './FormRow';
import S from './Form.css';

import TargetprocessLinkentity from './TargetprocessLinkentity';

export default class Form extends React.Component {

    static propTypes = {
        entity: T.object.isRequired,
        fields: T.arrayOf(FormRow.propTypes.item),
        globalError: T.string,
        onChange: T.func,
        onSubmit: T.func,
        showProgress: T.bool,
        values: T.object
    };

    static defaultProps = {
        fields: [],
        values: {}
    };

    render() {

        const {entity, fields, showProgress, globalError} = this.props;
        const hasInvalid = fields.some(({validationErrors = []}) => validationErrors.length);

        return (
            <div>
                <TargetprocessLinkentity className={S.header} entity={entity} />

                <div className={S.note}>{'Please specify the following custom fields'}</div>
                {globalError ? (
                    <div className={S.error}>{globalError}</div>
                ) : null}

                <form onSubmit={this.handleSubmit}>
                    {fields.map((field, k) => (
                        <FormRow
                            autoFocus={!k}
                            entity={entity}
                            item={field}
                            key={field.name}
                            onChange={this.handleChange}
                            ref={field.name}
                        />
                    ))}
                    <div className={S.buttons}>
                        <button
                            className="tau-btn tau-primary"
                            disabled={hasInvalid || showProgress || null}
                            type="submit"
                        >
                            {'Save and Continue'}
                        </button>
                    </div>
                </form>
            </div>
        );

    }

    handleSubmit = (e) => {

        e.preventDefault();

        const values = this.props.fields.map((field) => ({
            ...field,
            value: this.refs[field.name].value
        }));

        this.props.onSubmit(values);

    };

    handleChange = (field, value) => {

        this.props.onChange(field, value);

    };

}
