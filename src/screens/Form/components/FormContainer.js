import React, {PropTypes as T} from 'react';
import {find, object, has, partial, pluck, noop} from 'underscore';

import Overlay from 'components/Overlay';
import store from 'services/store';
import store2 from 'services/store2';
import {
    transformFromServerFieldValue,
    transformFieldFromServer,
    transformToServerFieldValue,
    sanitizeFieldValue,
    validateFieldValue
} from 'services/form';

import Form from './Form';
import TargetprocessLinkentity from './TargetprocessLinkentity';

import {header, note, error as errorStyle} from './FormContainer.css';

import {
    getCustomFieldsNamesForNewState,
    getCustomFieldsNamesForChangedCustomFields
} from 'services/customFieldsRequirements';

const pluckObject = (list, keyProp, valueProp) => object(list.map((v) => [v[keyProp], v[valueProp]]));

const getCustomFieldsByEntity = (processId, entity) => store2.get('CustomField', {
    take: 1000,
    where: `process.id == ${processId} and entityType.id == ${entity.entityType.id}`,
    select: 'new(required, name, id, config, fieldType, value, entityType, process)'
});

const getEntityCustomFieldValue = ({customFields: entityCustomFields}, field) => {

    const entityCustomField = find(entityCustomFields, (entityField) =>
        entityField.name.toLowerCase() === field.name.toLowerCase());

    return entityCustomField ? transformFromServerFieldValue(field, entityCustomField.value) : void 0;

};

const getCustomFieldsFromAllByNames = (customFields, fieldsNames) => {

    const customFieldsHash = object(customFields.map((v) => [v.name.toLowerCase(), v]));

    return fieldsNames.reduce((res, fieldName) =>
        customFieldsHash[fieldName.toLowerCase()] ?
        res.concat(customFieldsHash[fieldName.toLowerCase()]) :
        res,
    []);

};

const getInitialCustomFieldValue = (entity, field) =>
    getEntityCustomFieldValue(entity, field) || field.config.defaultValue;

const prepareFieldForForm = (entity, values, field) => {

    const {name} = field;
    const initialValue = getInitialCustomFieldValue(entity, field);
    const hasDirtyValue = has(values, field.name);
    const dirtyValue = values[field.name];
    const currentValue = hasDirtyValue ? dirtyValue : initialValue;

    const validationErrors = validateFieldValue(field, currentValue);
    const hasErrors = Boolean(validationErrors.length);

    return {
        name,
        field,
        hasDirtyValue,
        hasErrors,
        validationErrors,
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
        mashupConfig: T.array,
        onAfterSave: T.func,
        onCancel: T.func,
        processId: T.number.isRequired,
        requirementsData: T.object.isRequired
    }

    state = {
        defaultValues: {},
        isLoading: true,
        onAfterSave: noop,
        onCancel: noop,
        values: {}
    }

    componentDidMount() {

        const {processId, entity} = this.props;

        getCustomFieldsByEntity(processId, entity)
            .then((allEntityCustomFields) => {

                const processedFields = allEntityCustomFields.map((field) =>
                    transformFieldFromServer(field));

                const defaultValues = pluckObject(processedFields, 'name', 'defaultValue');

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
                    <div className={errorStyle}>{globalError}</div>
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

        const isAllFieldsValid = savedFields
            .every(({field, value}) => !validateFieldValue(field, sanitizeFieldValue(field, value)).length);

        if (!isAllFieldsValid) return;

        const dataToSave = {
            customFields: savedFields
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
            [field.name, transformFromServerFieldValue(field, getEntityCustomFieldValue(entity, field))]));

        let fieldsNames = [];

        if (newState) {

            const allValues = {
                ...defaultValues,
                ...values
            };

            const allValuesSanitized = object(allEntityCustomFields.map((v) =>
                [v.name, sanitizeFieldValue(v, allValues[v.name])]));

            fieldsNames = getCustomFieldsNamesForNewState(newState,
                mashupConfig, processId, entity.entityType.name,
                allValuesSanitized, existingValues);

        } else if (changedCFs.length) {

            const changedFieldsNames = pluck(changedCFs, 'name');

            const allValues = {
                ...defaultValues,
                ...values,
                ...object(changedCFs.map((v) => [v.name, v.value]))
            };

            const allValuesSanitized = object(allEntityCustomFields.map((v) =>
                [v.name, sanitizeFieldValue(v, allValues[v.name])]));

            fieldsNames = getCustomFieldsNamesForChangedCustomFields(changedFieldsNames,
                mashupConfig, processId, entity.entityType.name,
                allValuesSanitized, existingValues);

        }

        const fields = getCustomFieldsFromAllByNames(allEntityCustomFields, fieldsNames);

        return fields.map(partial(prepareFieldForForm, entity, values));

    }

}
