import React, {PropTypes as T} from 'react';
import {find, object, has, noop} from 'underscore';
import {when} from 'jquery';

import Overlay from 'components/Overlay';
import store from 'services/store';
import store2 from 'services/store2';
import {
    transformFromServerFieldValue,
    transformFieldFromServer,
    transformToServerFieldValue,
    sanitizeFieldValue,
    validateFieldValue,
    isEmptyInitialValue
} from 'services/form';
import {getCustomFieldsForAxes} from 'services/axes';

import {equalIgnoreCase} from 'utils';

import Form from './Form';

import {isUser, isGeneral} from 'utils';

const getCustomFieldsByEntity = (processId, entity) => store2.get('CustomField', {
    take: 1000,
    where: `process.id == ${processId || 'null'} and entityType.id == ${entity.entityType.id}`,
    select: 'new(required, name, id, config, fieldType, value, entityType, process)'
});

const getEntityCustomFieldValue = ({customFields: entityCustomFields}, field) => {

    const entityCustomField = find(entityCustomFields, (entityField) => equalIgnoreCase(entityField.name, field.name));

    return entityCustomField ? transformFromServerFieldValue(field, entityCustomField.value) : null;

};

const getInitialCustomFieldValue = (entity, field) => {

    const value = getEntityCustomFieldValue(entity, field);

    return isEmptyInitialValue(field, value) ? field.config.defaultValue : value;

};

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

const loadFullEntity = (entity) => {

    if (isGeneral(entity)) {

        return store.get('General', entity.id, {
            include: [
                'Name',
                'EntityType',
                {
                    Project: [{
                        Process: ['Id']
                    }]
                },
                'CustomFields'
            ]
        });

    } else if (isUser(entity)) {

        return store.get('User', entity.id, {
            include: [
                'FirstName',
                'LastName',
                'CustomFields'
            ]
        }).then((res) => ({
            ...entity,
            name: `${res.firstName} ${res.lastName}`,
            res
        }));

    }

};

const getDefaultValues = (customFields) => object(customFields.map((v) => [v.name, v.config.defaultValue]));

const getExistingValues = (customFields, entity) =>
    object(customFields.map((field) =>
        [
            field,
            getEntityCustomFieldValue(entity, field)
        ])
        .filter(([field, value]) => !isEmptyInitialValue(field, value))
        .map(([field, value]) => [field.name, value]));

const getProcessId = (entity) => entity.project ? entity.project.process.id : null;

const getOutputCustomFields = (mashupConfig, changes, entity, processId, values, entityCustomFields) => {

    const processes = [{id: processId}];

    const allValues = {
        ...getDefaultValues(entityCustomFields),
        ...values
    };

    const allValuesSanitized = object(entityCustomFields.map((v) =>
        [v.name, sanitizeFieldValue(v, allValues[v.name])]));

    const existingValues = getExistingValues(entityCustomFields, entity);

    return when(getCustomFieldsForAxes(mashupConfig, changes, processes, entity, allValuesSanitized, {}, existingValues))
        .then((serverCustomFields) =>
            serverCustomFields
                .map(transformFieldFromServer)
                .map((v) => prepareFieldForForm(entity, values, v)));

};

export default class FormContainer extends React.Component {

    static propTypes = {
        changes: T.array.isRequired,
        entity: T.shape({
            id: T.number.isRequired,
            entityType: T.shape({
                name: T.string.isRequired
            }).isRequired
        }).isRequired,
        mashupConfig: T.array,
        onAfterSave: T.func,
        onCancel: T.func
    }

    state = {
        isLoading: true,
        onAfterSave: noop,
        onCancel: noop,
        entityCustomFields: [],
        outputCustomFields: [],
        values: {}
    }

    componentDidMount() {

        getCustomFieldsForAxes.resetCache();

        const {entity, changes, mashupConfig} = this.props;
        const {values} = this.state;

        when(loadFullEntity(entity))
        .then((fullEntity) => {

            const processId = getProcessId(fullEntity);

            when(getCustomFieldsByEntity(processId, fullEntity))
            .then((serverCustomFields) => {

                const entityCustomFields = serverCustomFields.map((field) => transformFieldFromServer(field));

                this.setState({
                    processId,
                    entityCustomFields,
                    entity: fullEntity
                });

                return getOutputCustomFields(mashupConfig, changes, fullEntity, processId, values, entityCustomFields);

            })
            .then((outputCustomFields) => {

                if (!outputCustomFields.length) this.props.onAfterSave();
                else {

                    this.setState({
                        outputCustomFields,
                        isLoading: false
                    });

                }

            });

        });

    }

    render() {

        const {
            isLoading,
            isSaving,
            globalError,

            outputCustomFields,
            entity
        } = this.state;

        if (isLoading) return null;
        if (!outputCustomFields.length) return null;

        return (
            <Overlay onClose={this.props.onCancel}>

                <Form
                    entity={entity}
                    fields={outputCustomFields}
                    globalError={globalError}
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

        const values = {...this.state.values, [field.name]: value};

        const {mashupConfig, changes} = this.props;
        const {entity, processId, entityCustomFields} = this.state;

        when(getOutputCustomFields(mashupConfig, changes, entity, processId, values, entityCustomFields))
        .then((outputCustomFields) => {

            this.setState({
                outputCustomFields,
                values
            });

        });

    }

}
