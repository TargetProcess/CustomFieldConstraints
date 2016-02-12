import {isString, isEmpty, isNumber} from 'underscore';

const transformFromServerValue = (field, value) => {

    switch (field.type) {
        case 'multipleselectionlist':
            return (isString(value) && value) ? value.split(',') : [];
        case 'url': return value || {};
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

const isEmptyServerValue = (customField, serverValue) => !isNumber(serverValue) && isEmpty(serverValue);
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
        isEmpty: isEmptyServerValue(customField, inputValue),
        isInitialized: isInitializedServerValue(customField, inputValue),
        serverValue: transformToServerValue(customField, value)
    };

};
