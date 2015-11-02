import React, {PropTypes as T} from 'react';
import {find, object, has, partial, pluck} from 'underscore';

import Overlay from 'components/Overlay';
import store from 'services/store';
import store2 from 'services/store2';

import Form from './Form';
import TargetprocessLinkentity from './TargetprocessLinkentity';

import {header, note, error} from './FormContainer.css';

import {
    getCustomFieldsNamesForNewState,
    getCustomFieldsNamesForChangedCustomFields
} from 'services/customFieldsRequirements';

const getCustomFieldsByEntity = (processId, entity) => store2.get('CustomField', {
    take: 1000,
    where: `process.id == ${processId} and entityType.id == ${entity.entityType.id}`,
    select: 'new(required, name, id, config, fieldType, value, entityType, process)'
});

const transformFromServerFieldValue = (field, value) => {

    if (value) {

        if (field.type === 'multipleselectionlist') {

            return value.split(',');

        }

    }

    return value;

};

const transformToServerFieldValue = (field, value) => {

    if (field.type === 'multipleselectionlist' && value) {

        return value.join(',');

    }

    if (field.type === 'entity' && value) {

        const {id, entityType: {name: kind}, name} = value;

        return {id, kind, name};

    }

    if (field.type === 'richtext' && typeof value === 'string') {

        return `<!--markdown-->${value}`;

    }

    return value;

};

const getEntityCustomFieldValue = ({customFields: entityCustomFields}, field) => {

    const entityCustomField = find(entityCustomFields, (entityField) =>
        entityField.name.toLowerCase() === field.name.toLowerCase());

    return entityCustomField ? transformFromServerFieldValue(field, entityCustomField.value) : void 0;

};

const sanitizeFieldValue = (field, value) => {

    if (field.type === 'url' && value) {

        return ({
            url: value.url.trim(),
            label: value.label.trim()
        });

    }

    return typeof value === 'string' ? value.trim() : value;

};

const isEmptyValidator = (field, value) => {

    const validators = {
        text: (val) => !val,
        url: ({url, label} = {}) => !url || !label,
        checkbox: (val) => val !== false && val !== true
    };

    if ((validators[field.type] || validators.text)(value)) {

        return new Error('Field is empty');

    }

};

const validateFieldValue = (field, value) => {

    const sanitizedValue = sanitizeFieldValue(field, value);

    let validationErrors = [];

    [isEmptyValidator].forEach((validator) => {

        const error = validator(field, sanitizedValue);

        if (error) validationErrors = validationErrors.concat(error);

    });

    return validationErrors;

};

const getInitialCustomFieldValue = (entity, field) =>
    getEntityCustomFieldValue(entity, field) || field.config.defaultValue;

const getCustomFieldsFromAllByNames = (customFields, fieldsNames) => {

    const customFieldsHash = object(customFields.map((v) => [v.name.toLowerCase(), v]));

    return fieldsNames.reduce((res, fieldName) =>
        customFieldsHash[fieldName.toLowerCase()] ?
        res.concat(customFieldsHash[fieldName.toLowerCase()]) :
        res,
    []);

};

const prepareFieldForForm = (entity, values, field) => {

    const {name} = field;
    const initialValue = getInitialCustomFieldValue(entity, field);
    const hasDirtyValue = has(values, field.name);
    const dirtyValue = values[field.name];
    const currentValue = hasDirtyValue ? dirtyValue : initialValue;

    return {
        name,
        field,
        hasDirtyValue,
        validationErrors: validateFieldValue(field, currentValue),
        value: currentValue
    };

};

export default class FormContainer extends React.Component {

    static propTypes = {
        entity: T.shape({
            id: T.number.isRequired,
            entityType: T.shape({
                name: T.string.isRequired
            }).isRequired
        }).isRequired,
        mashupConfig: T.array.isRequired,
        onAfterSave: T.func.isRequired,
        onCancel: T.func.isRequired,
        processId: T.number.isRequired,
        requirementsData: T.object.isRequired
    }

    state = {
        isLoading: true,
        values: {},
        defaultValues: {}
    }

    componentDidMount() {

        getCustomFieldsByEntity(this.props.processId, this.props.entity)
            .then((allEntityCustomFields) => {

                const defaultValues = object(allEntityCustomFields.map((v) =>
                    [v.name, transformFromServerFieldValue(v, v.config.defaultValue)]));

                const processedFields = allEntityCustomFields.map((v) => ({
                    ...v,
                    type: v.fieldType.toLowerCase(),
                    config: {
                        ...v.config,
                        defaultValue: defaultValues[v.name]
                    }
                }));

                this.setState({
                    isLoading: false,
                    allEntityCustomFields: processedFields,
                    defaultValues
                });

            });

    }

    render() {

        const {isLoading, globalError, isSaving} = this.state;

        if (isLoading) return null;

        const {entity} = this.props;

        const realCustomFields = this.getCustomFields();

        if (!realCustomFields.length) return null;

        return (
            <Overlay onClose={this.props.onCancel}>

                <TargetprocessLinkentity className={header} entity={entity} />

                <div className={note}>{'Please specify the following custom fields'}</div>
                {globalError ? (
                    <div className={error}>{globalError}</div>
                ) : null}
                <Form
                    entity={entity}
                    fields={realCustomFields}
                    onChange={this.handleChange}
                    onSubmit={this.handleSubmit}
                    showProgress={isSaving}
                />
            </Overlay>
        );

    }

    handleSubmit = (savedFields) => {

        const {entity} = this.props;

        const dataToSave = {
            customFields: savedFields
                .filter(({field, value}) => !validateFieldValue(field, value).length)
                .map(({field, value, name}) => ({
                    name,
                    value: transformToServerFieldValue(field, sanitizeFieldValue(field, value))
                }))
        };

        this.setState({
            ...this.state,
            isSaving: true
        });

        store.save(entity.entityType.name, entity.id, dataToSave)
            .then(() => this.setState({
                ...this.state,
                isSaving: false
            }))
            .then(this.props.onAfterSave)
            .fail(({responseJSON}) => {

                if (responseJSON && responseJSON.Message) {

                    this.setState({
                        ...this.state,
                        globalError: responseJSON.Message,
                        isSaving: false
                    });

                } else {

                    this.setState({
                        ...this.state,
                        globalError: 'Error while saving',
                        isSaving: false
                    });

                }

            });

    }

    handleChange = (field, value) => {

        const valuesHash = {...this.state.values, [field.name]: value};

        this.setState({...this.state, values: valuesHash});

    }

    getCustomFields() {

        const {entity, requirementsData, mashupConfig, processId} = this.props;
        const {newState, changedCFs = []} = requirementsData;

        if (!newState && !changedCFs.length) return [];

        const {values, defaultValues, allEntityCustomFields} = this.state;

        const existingValues = object(allEntityCustomFields.map((field) =>
            [field.name, getEntityCustomFieldValue(entity, field)]));

        let fieldsNames = [];

        if (newState) {

            const allValues = {
                ...defaultValues,
                ...values
            };

            const allValuesSanitized = object(allEntityCustomFields.map((v) => [v.name, sanitizeFieldValue(v, allValues[v.name])]));

            fieldsNames = getCustomFieldsNamesForNewState(newState.name, mashupConfig, processId, entity.entityType.name,
                allValuesSanitized, existingValues);

        } else if (changedCFs.length) {

            const changedFieldsNames = pluck(changedCFs, 'name');

            const allValues = {
                ...defaultValues,
                ...values,
                ...object(changedCFs.map((v) => [v.name, v.value]))
            };

            const allValuesSanitized = object(allEntityCustomFields.map((v) => [v.name, sanitizeFieldValue(v, allValues[v.name])]));

            fieldsNames = getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, mashupConfig, processId, entity.entityType.name,
                allValuesSanitized, existingValues);

        }

        const fields = getCustomFieldsFromAllByNames(allEntityCustomFields, fieldsNames);

        return fields.map(partial(prepareFieldForForm, entity, values));

    }

}
