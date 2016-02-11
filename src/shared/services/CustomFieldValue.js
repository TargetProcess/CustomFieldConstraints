import {isString, isEmpty} from 'underscore';

const transformFromServerValue = (field, value) => {

    switch (field.type) {
        case 'multipleselectionlist':
        case 'multipleentities':
            return (isString(value) && value) ? value.split(',') : [];
        case 'url': return {};
        default:
            return value;
    }

};

const isEmptyServerValue = (customField, serverValue) => isEmpty(serverValue);
const isInitializedServerValue = (customField, serverValue) => serverValue !== null;

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
        isEmpty: isEmptyServerValue(customField, serverValue),
        isInitialized: isInitializedServerValue(customField, serverValue),
        serverValue: transformToServerValue(customField, value)
    };

};

export const fromInputValue = (customField, inputValue) => {

    const value = transformFromInputValue(customField, inputValue);

    return {
        name: customField.name,
        customField,
        value,
        isEmpty: isEmptyServerValue(customField, isEmpty),
        isInitialized: isInitializedServerValue(customField, isEmpty),
        serverValue: transformToServerValue(customField, value)
    };

};
