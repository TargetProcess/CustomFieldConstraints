import {isEmpty, find} from 'underscore';
import * as CustomFieldValue from 'services/CustomFieldValue';

export const sanitizeFieldValue = (field, value) => {

    if (field.type === 'url' && value) {

        return ({
            url: (value.url || '').trim(),
            label: (value.label || '').trim()
        });

    }

    return typeof value === 'string' ? value.trim() : value;

};

const isEmptyValidator = (field, value) => {

    const validators = {
        text: (val) => !val,
        url: ({url, label} = {}) => !url || !label,
        checkbox: (val) => CustomFieldValue.isEmptyCheckboxValue(val),
        multipleselectionlist: (val) => !val.length,
        multipleentities: (val) => !val.length
    };

    if ((validators[field.type] || validators.text)(value)) {

        if (field.type === 'checkbox') {

            return new Error(`This field should be checked`);

        }

        return new Error('This is a required field');

    }

};

const validateFieldValue = (field, value) => {

    const sanitizedValue = sanitizeFieldValue(field, value);

    let validationErrors = [];

    [isEmptyValidator].forEach((validator) => {

        const error = validator(field, sanitizedValue);

        if (error) validationErrors = validationErrors.concat(error);

    });

    return validationErrors;

};

export default (customFields, formValues, existingCustomFieldsValues) => {

    const isBound = !isEmpty(formValues);

    const formFields = customFields.map((customField) => {

        let customFieldValue;
        let isDirty = false;

        if (isBound && formValues.hasOwnProperty(customField.name)) {

            isDirty = true;
            customFieldValue = CustomFieldValue.fromInputValue(customField, formValues[customField.name]);

        } else {

            customFieldValue = find(existingCustomFieldsValues, (v) => v.name === customField.name);

            if (customFieldValue.value === null) {

                customFieldValue.value = customFieldValue.customField.defaultValue;

            }

        }

        if (!customFieldValue) {

            customFieldValue = CustomFieldValue.fromInputValue(customField, null);

        }

        const {name} = customFieldValue;
        const initialValue = customFieldValue.value;
        const hasDirtyValue = isDirty;
        const currentValue = initialValue;

        const validationErrors = validateFieldValue(customFieldValue.customField, customFieldValue.value);
        const hasErrors = Boolean(validationErrors.length);

        return {
            name,
            customFieldValue,
            field: customFieldValue.customField,
            hasDirtyValue,
            hasErrors,
            isValid: !validationErrors.length,
            validationErrors,
            value: currentValue
        };

    });

    return {
        fields: formFields,
        isValid: formFields.every((v) => v.isValid)
    };

};
