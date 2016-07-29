// TODO(anybody): Remove V121 after all users switch to TP > 3.9.2. Even better, add mashup versioning.

import $, {when} from 'jquery';
import {isFunction, flatten, map, some} from 'underscore';

const appConfigurator = require('tau/configurator');

import {isGlobalOrRelationsBus} from 'services/busNames';
import {equalIgnoreCase} from 'utils';

const isApiVersionLessOrEqualV121 = !isFunction(appConfigurator.getSliceFactory().create().cellActionsV3);

const isSameEntityTypeV121 = (v, entityType) => equalIgnoreCase($(v).data('type'), entityType.name);

const isSameEntityTypeV122 = (v, entityType) => {

    const $v = $(v);

    return equalIgnoreCase($v.data('type-name'), entityType.name) &&
        equalIgnoreCase($v.data('type-title'), entityType.title);

};

export const isSameEntityType = !isApiVersionLessOrEqualV121 ?
    isSameEntityTypeV122 : isSameEntityTypeV121;

const makeEntityType = (type) => ({
    name: type.name, title: type.title
});

const getEntityTypeOrTypes = (typeData, selector) => {

    const entityType = selector(typeData);

    return entityType ? [makeEntityType(entityType)] : map(typeData, (type) => makeEntityType(selector(type)));

};

const convertEntityTypes = (types, selector) =>
    flatten(map(types, (v) => getEntityTypeOrTypes(v, selector)));

export const getSliceDefinition = ({config}) =>
    (config.options && config.options.slice) ? config.options.slice.config.definition : null;

const getEntityTypesV121 = (initData, bindData) => {

    if (bindData.types) {

        return convertEntityTypes(bindData.types, (v) => v.entityType);

    } else if (initData.addAction) {

        return convertEntityTypes(initData.addAction.data.types, (v) => ({name: v.name}));

    } else {

        const sliceDefinition = getSliceDefinition(initData);

        if (sliceDefinition) {

            return convertEntityTypes(sliceDefinition.cells.types, (v) => ({name: v.type}));

        }

    }

    return [];

};

const getEntityTypesV122 = (initData, bindData) => {

    if (bindData.types) {

        return convertEntityTypes(bindData.types, (v) => v.entityType);

    }

    return [];

};

export const getEntityTypes = !isApiVersionLessOrEqualV121 ?
    getEntityTypesV122 : getEntityTypesV121;

const getStoredAcid = (configurator) => {

    const applicationStore = configurator.getAppStateStore();

    return when(applicationStore.get({fields: ['acid']}));

};

const getGlobalAcid = () => when({acid: null}).promise();

const isProjectsSlice = (sliceDefinition) =>
    sliceDefinition && some(sliceDefinition.cells.types, (t) => equalIgnoreCase(t.type, 'project'));

// Global and relations quick adds do not depend on context (↑V122). Also, projects slice is not depend on context.
const needGlobalAcid = (busName, sliceDefinition) =>
    isProjectsSlice(sliceDefinition) || (isGlobalOrRelationsBus(busName) && !isApiVersionLessOrEqualV121);

export const getAcid = (configurator, busName, sliceDefinition) =>
    needGlobalAcid(busName, sliceDefinition) ? getGlobalAcid() : getStoredAcid(configurator);

// Global and relations quick adds do not depend on axes.
const shouldIgnoreAxesV122 = (busName) => isGlobalOrRelationsBus(busName);

const shouldIgnoreAxesV121 = (/* busName */) => false;

export const shouldIgnoreAxes = !isApiVersionLessOrEqualV121 ?
    shouldIgnoreAxesV122 : shouldIgnoreAxesV121;
