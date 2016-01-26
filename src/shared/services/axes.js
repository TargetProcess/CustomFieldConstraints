import {when, whenList} from 'jquery';
import {find, flatten, unique} from 'underscore';

import {inValues, equalByShortcut, equalIgnoreCase, isGeneral} from 'utils';
import store from 'services/store';
import store2 from 'services/store2';
import {
    getCustomFieldsNamesForNewState,
    getCustomFieldsNamesForChangedCustomFields
} from 'services/customFieldsRequirements';

const findInRealCustomFields = (customFieldsNames, realCustomFields) =>
    customFieldsNames.reduce((res, v) => {

        const realCustomField = find(realCustomFields, (field) => equalIgnoreCase(field.name, v));

        return realCustomField ? res.concat(realCustomField) : res;

    }, []);

const getRealCustomFields = (customFieldsNames, processId, entityType) => {

    if (!customFieldsNames.length) return [];

    let customFields;

    if (isGeneral({entityType})) {

        customFields = store2.get('CustomField', {
            take: 1000,
            where: `process.id == ${processId} and entityType.name == "${entityType.name}"`,
            select: 'new(required, name, id, config, fieldType, value, entityType, process)'
        });

    } else {

        customFields = store2.get('CustomField', {
            take: 1000,
            where: `process.id == null and entityType.name == "${entityType.name}"`,
            select: 'new(required, name, id, config, fieldType, value, entityType, process)'
        });

    }

    return when(customFields)
    .then((realCustomFields) => findInRealCustomFields(customFieldsNames, realCustomFields));

};

const loadEntityStates = (processId) => {

    return store.get('EntityStates', {
        include: [{
            workflow: ['Id']
        }, {
            process: ['id']
        }, {
            entityType: ['name']
        },
            'name',
            'isInitial',
            'isFinal',
            'isPlanned', {
                subEntityStates: [
                    'id',
                    'name', {
                        workflow: ['id']
                    },
                    'isInitial',
                    'isFinal',
                    'isPlanned'
                ]
            }
        ],
        where: `Process.Id in (${processId})`
    });

};

const getRealEntityState = (targetValue, processId, entityType) =>
    when(loadEntityStates(processId))
    .then((items) => {

        if (targetValue.id) return find(items, (v) => v.id === targetValue.id);
        else {

            return find(items, (v) =>
                equalIgnoreCase(v.entityType.name, entityType.name) &&
                (equalIgnoreCase(targetValue, v.name) || equalByShortcut(targetValue, v)));

        }

    });

const getRealTargetValue = (axis, targetValue, processId, entity) => {

    if (axis.type === 'entitystate') {

        return getRealEntityState(targetValue, processId, entity.entityType);

    }

    if (axis.type === 'customfield') {

        return when(getRealCustomFields([axis.customFieldName], processId, entity.entityType))
        .then((items) => items.length ? items[0] : null);

    }

};

const getCustomFieldsForAxis = (config, axis, processes, entity, values = {}, options = {skipValuesCheck: false}, initialValues = {}) => {

    let cfs = [];
    const targetValue = axis.targetValue;

    return processes
        .reduce((res, {id: processId}) =>
            res
                .then(() => getRealTargetValue(axis, targetValue, processId, entity))
                .then((realTargetValue) => {

                    if (!realTargetValue) return [];

                    if (axis.type === 'entitystate') {

                        return getCustomFieldsNamesForNewState(realTargetValue, config, processId, entity.entityType.name, values, initialValues, options);

                    }

                    if (axis.type === 'customfield') {

                        const fullValues = {
                            ...values,
                            [realTargetValue.name]: targetValue
                        };

                        return getCustomFieldsNamesForChangedCustomFields([realTargetValue.name], config, processId, entity.entityType.name, fullValues, initialValues, options);

                    }

                })
                .then((customFieldsNames) => getRealCustomFields(customFieldsNames, processId, entity.entityType))
                .then((customFields) => {

                    cfs = cfs.concat(customFields);

                })

        , when([]))
        .then(() => cfs);

};

export const getCustomFieldsForAxes = (config, axes, processes, entity, values = {}, options = {}, initialValues = {}) =>
    whenList(axes.map((axis) => getCustomFieldsForAxis(config, axis, processes, entity, values, options, initialValues)))
        .then((...args) => flatten(args))
        .then((customFields) => {

            const allCustomFields = unique(customFields, (v) => v.name);

            // e.g. if we have state and cf axes and state axes requires same cf
            const customFieldsAsAxes = axes.reduce((res, axis) => (axis.type === 'customfield') ? res.concat(axis.customFieldName) : res, []);

            return allCustomFields.filter((v) => !inValues(customFieldsAsAxes, v.name));

        });
