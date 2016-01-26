import React, {PropTypes as T} from 'react';
import {find, object, has, noop, memoize} from 'underscore';
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

const getCustomFieldsForAxesMemo = memoize(getCustomFieldsForAxes);

import Form from './Form';
import TargetprocessLinkentity from './TargetprocessLinkentity';

import {header, note, error as errorStyle} from './FormContainer.css';

import {isUser, isGeneral} from 'utils';

const getCustomFieldsByEntity = (processId, entity) => store2.get('CustomField', {
    take: 1000,
    where: `process.id == ${processId || 'null'} and entityType.id == ${entity.entityType.id}`,
    select: 'new(required, name, id, config, fieldType, value, entityType, process)'
});

const getEntityCustomFieldValue = ({customFields: entityCustomFields}, field) => {

    const entityCustomField = find(entityCustomFields, (entityField) =>
        entityField.name.toLowerCase() === field.name.toLowerCase());

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
                'CustomFields'
            ]
        }).then((res) => ({
            ...entity,
            res
        }));

    }

};

const getProcessId = (entity) => entity.project ? entity.project.process.id : null;

const getCustomFields = (mashupConfig, changes, entity, processId, values, defaultValues, allEntityCustomFields) => {

    const processes = [{id: processId}];

    const existingValues = object(allEntityCustomFields
        .map((field) => [
            field,
            transformFromServerFieldValue(field, getEntityCustomFieldValue(entity, field))
        ])
        .filter(([field, value]) => !isEmptyInitialValue(field, value))
        .map(([field, value]) => [field.name, value]));

    const allValues = {
        ...defaultValues,
        ...values
    };

    const allValuesSanitized = object(allEntityCustomFields.map((v) =>
        [v.name, sanitizeFieldValue(v, allValues[v.name])]));

    return getCustomFieldsForAxesMemo(mashupConfig, changes, processes, entity, allValuesSanitized, {}, existingValues);

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
        defaultValues: {},
        isLoading: true,
        onAfterSave: noop,
        onCancel: noop,
        values: {},
        customFields: []
    }

    componentDidMount() {

        getCustomFieldsForAxesMemo.cache = [];

        const {entity, changes, mashupConfig} = this.props;
        const {values} = this.state;

        when(loadFullEntity(entity))
        .then((fullEntity) => {

            const processId = getProcessId(fullEntity);

            when(getCustomFieldsByEntity(processId, fullEntity))
            .then((allEntityCustomFields) => {

                const processedFields = allEntityCustomFields.map((field) =>
                    transformFieldFromServer(field));

                const defaultValues = object(processedFields.map((v) => [v.name, v.config.defaultValue]));

                this.setState({
                    processId,
                    allEntityCustomFields: processedFields,
                    defaultValues,
                    entity: fullEntity
                });

                return getCustomFields(mashupConfig, changes, entity, processId, values, defaultValues, allEntityCustomFields);

            })
            .then((customFields) => {

                if (!customFields.length) this.props.onAfterSave();
                else {

                    this.setState({
                        customFields,
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

            customFields,
            values,
            entity
        } = this.state;

        if (isLoading) return null;
        if (!customFields.length) return null;

        const realCustomFields = customFields
            .map(transformFieldFromServer)
            .map((v) => prepareFieldForForm(entity, values, v));

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

        const values = {...this.state.values, [field.name]: value};

        const {mashupConfig, changes} = this.props;
        const {entity, processId, defaultValues, allEntityCustomFields} = this.state;

        when(getCustomFields(mashupConfig, changes, entity, processId, values, defaultValues, allEntityCustomFields))
        .then((customFields) => {

            this.setState({
                customFields,
                values
            });

        });

    }

}
