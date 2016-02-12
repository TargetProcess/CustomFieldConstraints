import {find, pluck, isArray, uniq} from 'underscore';

const equalIgnoreCase = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
const getProp = (obj, key) => find(obj, (v, k) => equalIgnoreCase(k, key));
const inValues = (values, value = '') => {

    if (isArray(value)) {

        return value.some((v) => values.some((vv) => equalIgnoreCase(v, vv)));

    }

    return values.some((v) => equalIgnoreCase(v, value));

};

const equalByShortcut = (shortcut, entityState) => {

    return ({
        _initial: entityState.isInitial,
        _final: entityState.isFinal,
        _planned: entityState.isPlanned
    })[shortcut] || false;

};

const getFlatStateConfig = (config, processId, entityTypeName, entityState_) => {

    let entityState = entityState_;

    if (typeof entityState_ === 'string') {

        entityState = {
            name: entityState_
        };

    }

    const {name: entityStateName} = entityState;

    const processConfigs = config.filter((v) => !v.processId || v.processId === processId);

    return processConfigs.reduce((res, processConfig) => {

        const entityConfig = getProp(processConfig.constraints, entityTypeName);

        if (!entityConfig) return res;

        const statesConfig = getProp(entityConfig, 'entityStates');

        if (!statesConfig) return res;

        const stateConfigs = statesConfig.filter((v) =>
            equalIgnoreCase(v.name, entityStateName) || equalByShortcut(v.name, entityState));

        return stateConfigs.reduce((totalConfig, stateConfig) => ({
            ...totalConfig,
            requiredCustomFields: totalConfig.requiredCustomFields.concat(stateConfig.requiredCustomFields || [])
        }), res);

    }, {
        name: entityStateName,
        requiredCustomFields: []
    });

};

const getFlatCustomFieldsConfig = (config, processId, entityTypeName) => {

    const processConfigs = config.filter((v) => !v.processId || v.processId === processId);

    return processConfigs.reduce((res, processConfig) => {

        const entityConfig = getProp(processConfig.constraints, entityTypeName);

        if (!entityConfig) return res;

        const customFieldsConfigs = getProp(entityConfig, 'customFields');

        if (!customFieldsConfigs) return res;

        return res.concat(customFieldsConfigs);

    }, []);

};

const processCustomFieldsConfig = (config) => config.map((v) => ({
    ...v,
    requiredCustomFields: (v.requiredCustomFields || []).map((vv) => ({name: vv}))
}));

const getValue = (field, values) => {

    return values[field.name];

};

const checkCustomFieldByValue = (fieldByConfig, value) => {

    if (fieldByConfig.valueIn && !inValues(fieldByConfig.valueIn, value)) return false;

    if (fieldByConfig.valueNotIn && inValues(fieldByConfig.valueNotIn, value)) return false;

    return true;

};

const getConnectedCustomFieldByValue = (fieldByConfig, customFieldValue, skipValuesCheck) => {

    if (!fieldByConfig.requiredCustomFields) return [];

    if (skipValuesCheck) return fieldByConfig.requiredCustomFields;

    return checkCustomFieldByValue(fieldByConfig, customFieldValue) ? fieldByConfig.requiredCustomFields : [];

};

const getConnectedCustomFieldsByValue = (fieldsByStateFromCustomFieldsConfig, customFieldValue, customFieldsConfig, skipValuesCheck) => {

    return fieldsByStateFromCustomFieldsConfig.reduce((res, v) =>
        res.concat(getConnectedCustomFieldByValue(v, customFieldValue, skipValuesCheck)), []);

};

const getConnectedCustomFieldsByField = (field, customFieldsConfig, customFieldsValues, initialCustomFieldsValues, skipValuesCheck) => {

    const fieldsByStateFromCustomFieldsConfig =
        customFieldsConfig.filter((v) => equalIgnoreCase(v.name, field.name));

    const customFieldValue = getValue(field, customFieldsValues);

    const connectedNames = pluck(fieldsByStateFromCustomFieldsConfig, 'name');
    const customFieldsConfigWithoutSource = customFieldsConfig.filter((v) => connectedNames.indexOf(v.name) < 0);

    const connected = getConnectedCustomFieldsByValue(fieldsByStateFromCustomFieldsConfig,
        customFieldValue, customFieldsConfigWithoutSource, skipValuesCheck);

    if (connected.length) {

        /* eslint-disable no-use-before-define */
        return getConnectedCustomFields(connected, customFieldsConfigWithoutSource, customFieldsValues, initialCustomFieldsValues, true, skipValuesCheck);
        /* eslint-enable no-use-before-define */

    }

    return [];

};

const getConnectedCustomFields = (fields, customFieldsConfig, currentCustomFieldsValues, initialCustomFieldsValues, includeTop = true, skipValuesCheck = false) => {

    return fields.reduce((res, field) => {

        if (includeTop && initialCustomFieldsValues.hasOwnProperty(field.name)) return res;

        let ret = res;

        if (includeTop) ret = ret.concat(field);

        ret = ret.concat(getConnectedCustomFieldsByField(field, customFieldsConfig, currentCustomFieldsValues, initialCustomFieldsValues, skipValuesCheck));

        return ret;

    }, []);

};

export const getCustomFieldsNamesForNewState = (entityState, config, processId, entityTypeName,
    currentCustomFieldsValues = {}, initialCustomFieldsValues = {}, {skipValuesCheck} = {skipValuesCheck: false}) => {

    const stateConfig = getFlatStateConfig(config, processId, entityTypeName, entityState);
    const customFieldsConfig = processCustomFieldsConfig(getFlatCustomFieldsConfig(config, processId, entityTypeName));

    const rootFields = stateConfig.requiredCustomFields.map((v) => ({name: v}));

    const allFields = getConnectedCustomFields(rootFields, customFieldsConfig, currentCustomFieldsValues, initialCustomFieldsValues, true, skipValuesCheck);

    return uniq(pluck(allFields, 'name'));

};

export const getCustomFieldsNamesForChangedCustomFields = (changedFieldsNames, config, processId, entityTypeName,
    currentCustomFieldsValues = {}, initialCustomFieldsValues = {}, {skipValuesCheck} = {skipValuesCheck: false}) => {

    const customFieldsConfig = processCustomFieldsConfig(getFlatCustomFieldsConfig(config, processId, entityTypeName));

    const rootFields = customFieldsConfig.filter((v) =>
        inValues(changedFieldsNames, v.name) && checkCustomFieldByValue(v, getValue(v, currentCustomFieldsValues)));

    const allFields = getConnectedCustomFields(rootFields, customFieldsConfig, currentCustomFieldsValues, initialCustomFieldsValues, false, skipValuesCheck);

    return uniq(pluck(allFields, 'name'));

};

export const getCustomFieldsNamesForChangedCustomFieldsWithDependent = (changedFieldsNames, entityState, config, processId, entityTypeName,
    currentCustomFieldsValues = {}, initialCustomFieldsValues = {}, options = {}) => {

    const ownFields = getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, config, processId, entityTypeName, currentCustomFieldsValues, initialCustomFieldsValues, options);

    const rootFields = processCustomFieldsConfig(getFlatCustomFieldsConfig(config, processId, entityTypeName));

    const fieldsFromParentCustomFieldsConstraints = rootFields.reduce((res, field) => {

        return res.concat(getCustomFieldsNamesForChangedCustomFields([field.name], config, processId, entityTypeName, initialCustomFieldsValues, currentCustomFieldsValues, options));

    }, []);

    const fieldsFromEntityStateConstraints = entityState ? getCustomFieldsNamesForNewState(entityState, config, processId, entityTypeName, {}, currentCustomFieldsValues, options) : [];

    const fieldsFromChanged = changedFieldsNames.filter((fieldName) => inValues(fieldsFromParentCustomFieldsConstraints, fieldName) || inValues(fieldsFromEntityStateConstraints, fieldName));

    return uniq(fieldsFromChanged.concat(ownFields));

};
