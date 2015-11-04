import {compact, invoke, isString} from 'underscore';

const processServerSelectOptions = (options = []) =>
    isString(options) ?
    compact(invoke(options.split(/\r?\n/), 'trim')) :
    [];

export const transformFromServerFieldValue = (field, value) => {

    if (field.type === 'multipleselectionlist') {

        return isString(value) ? value.split(',') : [];

    }

    return value;

};

export const transformFieldFromServer = (field) => {

    const processedField = {
        ...field,
        type: field.fieldType.toLowerCase()
    };

    processedField.config.defaultValue =
        transformFromServerFieldValue(processedField, processedField.config.defaultValue);

    if (processedField.type === 'multipleselectionlist' || processedField.type === 'dropdown') {

        processedField.value = processServerSelectOptions(processedField.value);

    }

    return processedField;

};

export const transformToServerFieldValue = (field, value) => {

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

export const sanitizeFieldValue = (field, value) => {

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
        checkbox: (val) => val !== false && val !== true,
        multipleselectionlist: (val) => !val.length
    };

    if ((validators[field.type] || validators.text)(value)) {

        return new Error('Field is empty');

    }

};

export const validateFieldValue = (field, value) => {

    const sanitizedValue = sanitizeFieldValue(field, value);

    let validationErrors = [];

    [isEmptyValidator].forEach((validator) => {

        const error = validator(field, sanitizedValue);

        if (error) validationErrors = validationErrors.concat(error);

    });

    return validationErrors;

};
