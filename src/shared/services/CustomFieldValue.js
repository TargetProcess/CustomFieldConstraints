import {isBoolean, isString, isEmpty, isNumber} from 'underscore';
import dateUtils from 'tau/utils/utils.date';
import {equalIgnoreCase} from 'utils';

const transformFromServerValue = (field, value) => {

    switch (field.type) {
        case 'multipleselectionlist':
            return (isString(value) && value) ? value.split(',') : [];
        case 'url': return value || {};
        case 'date': {

            const serverDate = dateUtils.parseToServerDateTime(value);

            return serverDate ? dateUtils.format.date.short(serverDate) : value;

        }
        case 'entity':
            if (value) {

                const {id, kind, name} = value;

                return {
                    id,
                    name,
                    entityType: {
                        name: kind
                    }
                };

            }

            return value;
        case 'multipleentities': {

            const vals = (isString(value) && value) ? value.split(',') : [];

            return vals.map((v) => {

                const [id, kind] = v.split(' ');

                return {
                    id,
                    entityType: {
                        name: kind
                    }
                };

            });

        }
        default:
            return value;
    }

};

const isAssumeEmptyServerValue = (customField, serverValue) => {

    // Assume checkboxes are always empty, since we need to require them every time rule is match (in real they are true/false only).
    return customField.type === 'checkbox' || (!isNumber(serverValue) && !isBoolean(serverValue) && isEmpty(serverValue));

};

const transformFromInputValue = (customField, value) => value;

const transformToServerValue = (field, value) => {

    if (field.type === 'multipleselectionlist' && value) {

        return value.join(',');

    }

    if (field.type === 'entity' && value) {

        const {id, entityType: {name: kind}, name} = value;

        return {id, kind, name};

    }

    if (field.type === 'multipleentities' && value) {

        return value.map((entity) => `${entity.id} ${entity.entityType.name.toLowerCase()}`).join(',');

    }

    return value;

};

export const fromServerValue = (customField, serverValue) => {

    const value = transformFromServerValue(customField, serverValue);

    return {
        name: customField.name,
        customField,
        value,
        isAssumeEmpty: isAssumeEmptyServerValue(customField, serverValue),
        serverValue: transformToServerValue(customField, value)
    };

};

export const fromInputValue = (customField, inputValue) => {

    const value = transformFromInputValue(customField, inputValue);

    return {
        name: customField.name,
        customField,
        value,
        isAssumeEmpty: isAssumeEmptyServerValue(customField, inputValue),
        serverValue: transformToServerValue(customField, value)
    };

};

// TP can send null when we uncheck checkbox custom field, override to correct value false.
export const getCustomFieldValue = (customField) => equalIgnoreCase(customField.type, 'checkbox')
    ? Boolean(customField.value) : customField.value;
