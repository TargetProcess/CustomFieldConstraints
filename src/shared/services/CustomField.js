import {isString, pick, compact, invoke, isEmpty} from 'underscore';
import {inValues, lc} from 'utils';

const transformFromServerConfig = (serverCustomField) => {

    const config = serverCustomField.config;
    const value = serverCustomField.value;

    if (inValues(['multipleselectionlist', 'dropdown'], serverCustomField.fieldType)) {

        config.options = isString(value) ? compact(invoke(value.split(/\r?\n/), 'trim')) : [];

    }

    if (inValues(['multipleentities', 'entity'], serverCustomField.fieldType)) {

        config.entityTypeIds = isString(value) ? compact(invoke(value.split(/\r?\n/), 'trim')) : [];

    }

    if (inValues(['templatedurl'], serverCustomField.fieldType)) {

        config.template = value;

    }

    return config;

};

const transformFromServerDefaultValue = (serverCustomField) => {

    const value = serverCustomField.config.defaultValue;

    let defaultValue = null;

    switch (lc(serverCustomField.fieldType)) {

        case 'multipleselectionlist':
        case 'multipleentities':
            defaultValue = (isString(value) && value) ? value.split(',') : [];
            break;
        case 'entity':
            defaultValue = value || null;
            break;
        default:
            defaultValue = value;
            break;

    }

    return defaultValue;

};

const isEmptyDefaultValue = (customField) => isEmpty(customField.defaultValue);

export default (serverCustomField) => {

    const customField = {
        ...pick(serverCustomField, 'name', 'entityType'),
        type: serverCustomField.fieldType.toLowerCase(),
        config: {}
    };

    customField.defaultValue = transformFromServerDefaultValue(serverCustomField);
    customField.isEmptyDefaultValue = isEmptyDefaultValue(customField);
    customField.config = transformFromServerConfig(serverCustomField);

    return customField;

};
