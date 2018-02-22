import {find, pluck, isArray, omit, uniq} from 'underscore';

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

const getProcessConfigs = (config, process) =>
    config.filter((v) =>
        (!v.processId && !v.process && !v.processName) ||
        (v.processId && v.processId === process.id) ||
        (v.process && v.process === process.name) ||
        (v.processName && v.processName === process.name));

const getFlatStateConfig = (config, process, entityTypeName, entityState_) => {

    let entityState = entityState_;

    if (typeof entityState_ === 'string') {

        entityState = {
            name: entityState_
        };

    }

    const {name: entityStateName} = entityState;

    const processConfigs = getProcessConfigs(config, process);

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

const getFlatCustomFieldsConfig = (config, process, entityTypeName) => {

    const processConfigs = getProcessConfigs(config, process);

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

export const getCustomFieldsNamesForNewState = (entityState, config, process, entityTypeName,
                                                currentCustomFieldsValues = {}, initialCustomFieldsValues = {}, {skipValuesCheck} = {skipValuesCheck: false}) => {

    const stateConfig = getFlatStateConfig(config, process, entityTypeName, entityState);
    const customFieldsConfig = processCustomFieldsConfig(getFlatCustomFieldsConfig(config, process, entityTypeName));

    const rootFields = stateConfig.requiredCustomFields.map((v) => ({name: v}));

    const allFields = getConnectedCustomFields(rootFields, customFieldsConfig, currentCustomFieldsValues, initialCustomFieldsValues, true, skipValuesCheck);

    return uniq(pluck(allFields, 'name'));

};

export const getCustomFieldsNamesForChangedCustomFields = (changedFieldsNames, config, process, entityTypeName,
                                                           currentCustomFieldsValues = {}, initialCustomFieldsValues = {}, {skipValuesCheck} = {skipValuesCheck: false}) => {

    const customFieldsConfig = processCustomFieldsConfig(getFlatCustomFieldsConfig(config, process, entityTypeName));

    const rootFields = customFieldsConfig.filter((v) =>
        inValues(changedFieldsNames, v.name) && checkCustomFieldByValue(v, getValue(v, currentCustomFieldsValues)));

    const allFields = getConnectedCustomFields(rootFields, customFieldsConfig, currentCustomFieldsValues, initialCustomFieldsValues, false, skipValuesCheck);

    return uniq(pluck(allFields, 'name'));

};

export const getCustomFieldsNamesForChangedCustomFieldsWithDependent = (changedFieldsNames, entityState, config, process, entityTypeName,
                                                                        currentCustomFieldsValues = {}, initialCustomFieldsValues = {}, options = {}) => {

    const ownFields = getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, config, process, entityTypeName, currentCustomFieldsValues, initialCustomFieldsValues, options);

    const rootFields = processCustomFieldsConfig(getFlatCustomFieldsConfig(config, process, entityTypeName));

    const fullInitialCustomFieldsValues = changedFieldsNames.reduce((initialValues, name) => omit(initialValues, name), initialCustomFieldsValues);

    const fieldsFromParentCustomFieldsConstraints = rootFields.reduce((res, field) => {

        const needChangedFieldValue = find(changedFieldsNames, (name) => name === field.name) === void 0;
        const initialChangedFieldValue = needChangedFieldValue ? fullInitialCustomFieldsValues[field.name] : void 0;
        const fullCurrentCustomFieldValues = initialChangedFieldValue !== void 0 ? {
            ...currentCustomFieldsValues,
            ...{[field.name]: initialChangedFieldValue}
        } : currentCustomFieldsValues;

        return res.concat(getCustomFieldsNamesForChangedCustomFields([field.name], config, process, entityTypeName, fullCurrentCustomFieldValues, fullInitialCustomFieldsValues, options));

    }, []);

    const fieldsFromEntityStateConstraints = entityState ? getCustomFieldsNamesForNewState(entityState, config, process, entityTypeName, currentCustomFieldsValues, fullInitialCustomFieldsValues, options) : [];

    return uniq(fieldsFromParentCustomFieldsConstraints.concat(fieldsFromEntityStateConstraints).concat(ownFields));

};
