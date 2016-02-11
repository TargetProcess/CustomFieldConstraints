import React, {PropTypes as T} from 'react';
import {find, object, noop, map} from 'underscore';
import {when} from 'jquery';

import Overlay from 'components/Overlay';
import store from 'services/store';
import store2 from 'services/store2';

import {getCustomFieldsForAxes} from 'services/axes';

import {isUser, isGeneral, equalIgnoreCase} from 'utils';

import FormComponent from './Form';

import CustomField from 'services/CustomField';
import * as CustomFieldValue from 'services/CustomFieldValue';
import Form from 'services/Form';

const getCustomFieldsByEntity = (processId, entity) => store2.get('CustomField', {
    take: 1000,
    where: `process.id == ${processId || 'null'} and entityType.id == ${entity.entityType.id}`,
    select: 'new(required, name, id, config, fieldType, value, entityType, process)'
});

const loadFullEntity = (entity) => {

    if (equalIgnoreCase(entity.entityType.name, 'project')) {

        return store.get('Project', entity.id, {
            include: [
                'Name',
                'EntityType',
                {
                    Process: ['Id']
                },
                'CustomFields'
            ]
        });

    } else if (isGeneral(entity)) {

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

const getProcessId = (entity) => {

    if (entity.process) return entity.process.id;
    else if (entity.project) return entity.project.process.id;
    else return null;

};

const getOutputCustomFields = (mashupConfig, changes, processId, entity, entityCustomFields = [], existingCustomFieldsValues = [], formValues = {}) => {

    const existingValuesNormalized = object(existingCustomFieldsValues.filter((v) => !v.isEmpty).map((v) => [v.name, v.value]));

    const defaultValuesNormalized = object(entityCustomFields.filter((v) => !v.isEmptyDefaultValue).map((v) => [v.name, v.defaultValue]));

    const formCustomFieldsValues = map(formValues, (value, name) => CustomFieldValue.fromInputValue(find(entityCustomFields, (cf) => cf.name === name), value));
    const formCustomFieldsValuesNormalized = object(formCustomFieldsValues.map((v) => [v.name, v.value]));

    const currentValuesNormalized = {
        ...defaultValuesNormalized,
        ...formCustomFieldsValuesNormalized
    };

    const processes = [{id: processId}];

    return when(getCustomFieldsForAxes(mashupConfig, changes, processes, entity, currentValuesNormalized, {}, existingValuesNormalized))
        .then((serverCustomFields) => {

            const customFields = serverCustomFields.map((v) => CustomField(v));

            return customFields;

        });

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
    };

    state = {
        isLoading: true,
        onAfterSave: noop,
        onCancel: noop,
        entityCustomFields: [],
        outputCustomFields: [],
        formValues: {}
    };

    componentDidMount() {

        getCustomFieldsForAxes.resetCache();

        const {entity, changes, mashupConfig} = this.props;
        const {formValues} = this.state;

        if (!changes.length) return null;

        when(loadFullEntity(entity))
        .then((fullEntity) => {

            const processId = getProcessId(fullEntity);

            when(getCustomFieldsByEntity(processId, fullEntity))
            .then((serverCustomFields) => {

                const entityCustomFields = serverCustomFields.map((serverCustomField) => CustomField(serverCustomField));

                const existingCustomFieldsValues = entityCustomFields.map((customField) =>
                    CustomFieldValue.fromServerValue(customField, find(fullEntity.customFields, (v) => v.name === customField.name).value));

                this.setState({
                    processId,
                    entityCustomFields,
                    entity: fullEntity,
                    existingCustomFieldsValues
                });

                return getOutputCustomFields(mashupConfig, changes, processId, fullEntity, entityCustomFields, existingCustomFieldsValues, formValues);

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

        const {changes} = this.props;

        const {
            isLoading,
            isSaving,
            globalError,

            outputCustomFields,
            entity
        } = this.state;

        if (!changes.length) return null;
        if (isLoading) return null;
        if (!outputCustomFields.length) return null;

        const {formValues, existingCustomFieldsValues} = this.state;

        const form = Form(outputCustomFields, formValues, existingCustomFieldsValues);
        const fields = form.fields;

        return (
            <Overlay onClose={this.props.onCancel}>
                <FormComponent
                    entity={entity}
                    fields={fields}
                    globalError={globalError}
                    onChange={this.handleChange}
                    onSubmit={this.handleSubmit}
                    showProgress={isSaving}
                />
            </Overlay>
        );

    }

    handleSubmit = (formValues_) => {

        const formValues = object(formValues_.map((v) => [v.name, v.value]));

        const {entity} = this.props;
        const {entityCustomFields, existingCustomFieldsValues} = this.state;
        const customFields = entityCustomFields.filter((v) => formValues.hasOwnProperty(v.name));

        const form = Form(customFields, formValues, existingCustomFieldsValues);

        if (!form.isValid) return;

        const customFieldValues = form.fields.map((v) => v.customFieldValue);

        const dataToSave = {
            customFields: customFieldValues
                .map(({name, serverValue}) => ({
                    name,
                    value: serverValue
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

    };

    handleChange = (field, value) => {

        const formValues = {...this.state.formValues, [field.name]: value};

        const {mashupConfig, changes} = this.props;
        const {entity, processId, entityCustomFields, existingCustomFieldsValues} = this.state;

        when(getOutputCustomFields(mashupConfig, changes, processId, entity, entityCustomFields, existingCustomFieldsValues, formValues))
        .then((outputCustomFields) => {

            this.setState({
                outputCustomFields,
                formValues
            });

        });

    };

}
