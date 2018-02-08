import React, {PropTypes as T} from 'react';
import {find, isEqual, object, noop, map} from 'underscore';
import {when} from 'jquery';
import configurator from 'tau/configurator';

import Overlay from 'components/Overlay';
import store from 'services/store';

import {getCustomFieldsForAxes} from 'services/axes';
import {getCustomFields} from 'services/loaders';

import {isUser, isGeneral, isAssignable, isRequester, equalIgnoreCase} from 'utils';

import FormComponent from './Form';
import {getFieldValue} from '../fields';

import CustomField from 'services/CustomField';
import * as CustomFieldValue from 'services/CustomFieldValue';
import Form from 'services/Form';

import {CustomFieldsUpdateState} from 'utils';

const loadFullEntity = (entity) => {

    if (equalIgnoreCase(entity.entityType.name, 'project')) {

        return store.get('Project', entity.id, {
            include: [
                'Name',
                'EntityType',
                {
                    EntityState: [
                        'Id',
                        'Name',
                        'isInitial',
                        'isFinal',
                        'isPlanned'
                    ]
                },
                {
                    Process: ['Id', 'Name']
                },
                'CustomFields'
            ]
        });

    } else if (isAssignable(entity) || equalIgnoreCase(entity.entityType.name, 'impediment')) {

        return store.get(entity.entityType.name, entity.id, {
            include: [
                'Name',
                'EntityType',
                {
                    EntityState: [
                        'Id',
                        'Name',
                        'isInitial',
                        'isFinal',
                        'isPlanned'
                    ]
                },
                {
                    Project: [{
                        Process: ['Id', 'Name']
                    }]
                },
                'CustomFields'
            ]
        });

    } else if (isGeneral(entity)) {

        return store.get(entity.entityType.name, entity.id, {
            include: [
                'Name',
                'EntityType',
                {
                    Project: [{
                        Process: ['Id', 'Name']
                    }]
                },
                'CustomFields'
            ]
        });

    } else if (isUser(entity)) {

        return store.get(isRequester(entity) ? 'Requester' : 'User', entity.id, {
            include: [
                'FirstName',
                'LastName',
                'CustomFields'
            ]
        }).then((res) => ({
            ...entity,
            name: `${res.firstName} ${res.lastName}`,
            ...res
        }));

    }

};

const nullProcess = {id: null};

const getProcess = (entity) => {

    if (entity.process) return entity.process;
    else if (entity.project) return entity.project.process;
    else return nullProcess;

};

const getOutputCustomFields = (mashupConfig, changes, process, entity, entityCustomFields = [], existingCustomFieldsValues = [], formValues = {}) => {

    const existingValuesNormalized = object(existingCustomFieldsValues.filter((v) => !v.isAssumeEmpty).map((v) => [v.name, v.value]));
    const defaultValuesNormalized = object(entityCustomFields.filter((v) => !v.isEmptyDefaultValue).map((v) => [v.name, v.defaultValue]));

    const formCustomFieldsValues = map(formValues, (value, name) => CustomFieldValue.fromInputValue(find(entityCustomFields, (cf) => cf.name === name), value));
    const formCustomFieldsValuesNormalized = object(formCustomFieldsValues.map((v) => [v.name, v.value]));

    const currentValuesNormalized = {
        ...defaultValuesNormalized,
        ...formCustomFieldsValuesNormalized
    };

    const processes = [process];

    return when(getCustomFieldsForAxes(mashupConfig, changes, processes, entity, currentValuesNormalized, {}, existingValuesNormalized))
        .then((serverCustomFields) => {

            return serverCustomFields.sort((l, r) => l.numericPriority - r.numericPriority)
                .map((v) => CustomField(v));

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

        const {entity, changes, mashupConfig, onAfterSave} = this.props;
        const {formValues} = this.state;

        if (!changes.length) return null;

        when(loadFullEntity(entity))
        .then((fullEntity) => {

            const process = getProcess(fullEntity);
            const entityStates = getCustomFieldsForAxes.preloadParentEntityStates([process]);

            return when(getCustomFields(process.id, fullEntity.entityType), fullEntity, process, entityStates);

        })
        .then((serverCustomFields, fullEntity, process) => {

            const entityCustomFields = serverCustomFields.map((serverCustomField) => CustomField(serverCustomField));

            const existingCustomFieldsValues = entityCustomFields.map((customField) =>
                CustomFieldValue.fromServerValue(customField, find(fullEntity.customFields, (v) => v.name === customField.name).value));

            this.setState({
                process,
                entityCustomFields,
                entity: fullEntity,
                existingCustomFieldsValues
            });

            return when(fullEntity, process, entityCustomFields, getOutputCustomFields(mashupConfig, changes, process,
                fullEntity, entityCustomFields, existingCustomFieldsValues, formValues), existingCustomFieldsValues);

        })
        .then((fullEntity, process, entityCustomFields, outputCustomFields, existingCustomFieldsValues) => {

            if (!outputCustomFields.length) onAfterSave();
            else {

                const form = Form(outputCustomFields, formValues, existingCustomFieldsValues);
                // formValues can be changed (ex. set to current for showing on the form to client).
                const newFormValues = {...formValues, ...object(form.fields.map((x) => [x.name, x.value]))};

                // Recompute in memory, no requests.
                return when(getOutputCustomFields(mashupConfig, changes, process, fullEntity, entityCustomFields,
                    existingCustomFieldsValues, newFormValues), newFormValues);

            }

        })
        .then((outputCustomFields, newFormValues) => {

            this.setState({
                outputCustomFields,
                formValues: newFormValues,
                isLoading: false
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

    areFieldsSame = (server, current) => {

        const serverValue = CustomFieldValue.fromServerValue(server.customField, getFieldValue(server));
        const currentValue = CustomFieldValue.fromInputValue(current.customField, getFieldValue(current));

        return isEqual(serverValue, currentValue);

    };

    handleSubmit = (formValues) => {

        const {entity, replaceCustomFieldValueInChanges} = this.props;
        const {entityCustomFields, existingCustomFieldsValues} = this.state;
        const formValuesMap = object(formValues.map((v) => [v.name, v.value]));
        const customFields = entityCustomFields.filter((v) => formValuesMap.hasOwnProperty(v.name));
        const existingCustomFieldsValuesMap = object(existingCustomFieldsValues.map((v) => [v.name, v]));
        const changedFormValues = formValues.filter((v) => {

            const existingValue = existingCustomFieldsValuesMap[v.name];

            // Checkboxes should be saved every time, since some other values may change and TP can save same checkboxes.
            return existingValue !== void 0 &&
                !this.areFieldsSame({...existingValue, value: existingValue.serverValue}, {...existingValue, value: v.value});

        });
        const changedFormValuesMap = object(changedFormValues.map((v) => [v.name, v.value]));
        const changedCustomFields = customFields.filter((f) => changedFormValuesMap.hasOwnProperty(f.name));

        // TP expects not same values to save, or can't detect save finished.
        if (!changedFormValues.length) {

            this.props.onCancel({updateState: CustomFieldsUpdateState.Skipped});
            return;

        }

        const form = Form(changedCustomFields, changedFormValuesMap, existingCustomFieldsValues);

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

        customFieldValues.forEach(({name, serverValue}) => replaceCustomFieldValueInChanges(name, serverValue));

        // Need to notify TP store about changes in case comet disabled or no subscriptions.
        configurator.getStore().evictProperties(entity.id, entity.entityType.name, ['customFields']);

        store.save(entity.entityType.name, entity.id, dataToSave)
            .then(() => this.setState({
                ...this.state,
                isSaving: false
            }))
            .then(() => this.handleSave(customFields.length, changedCustomFields.length))
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

    handleSave = (originalCfCount, savedCfCount) => {

        // Tp can't save custom field with same value.
        if (originalCfCount !== savedCfCount) {

            this.props.onCancel({updateState: CustomFieldsUpdateState.Partial});

        } else {

            setTimeout(this.props.onAfterSave, 500); // comet race conditions :(

        }

    };

    handleChange = (field, value) => {

        const formValues = {...this.state.formValues, [field.name]: value};

        const {mashupConfig, changes} = this.props;
        const {entity, process, entityCustomFields, existingCustomFieldsValues} = this.state;

        when(getOutputCustomFields(mashupConfig, changes, process, entity, entityCustomFields, existingCustomFieldsValues, formValues))
            .then((outputCustomFields) => {

                this.setState({
                    outputCustomFields,
                    formValues
                });

            });

    };

}
