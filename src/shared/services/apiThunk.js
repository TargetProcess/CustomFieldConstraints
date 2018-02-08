import {Deferred, when} from 'jquery';
import {flatten, map, some} from 'underscore';

import {isGlobalOrRelationsBus} from 'services/busNames';
import {equalIgnoreCase} from 'utils';

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

export const getEntityTypes = (initData, bindData) => {

    if (bindData.types) {

        return convertEntityTypes(bindData.types, (v) => v.entityType);

    }

    return [];

};

// Global and relations quick adds do not depend on axes.
export const shouldIgnoreAxes = (busName) => isGlobalOrRelationsBus(busName);

const getStoredAcid = (configurator) => {

    const applicationStore = configurator.getAppStateStore();

    return when(applicationStore.get({fields: ['acid']}));

};

const getGlobalAcid = () => when({acid: null}).promise();

const isProjectsSlice = (sliceDefinition) =>
    sliceDefinition && some(sliceDefinition.cells.types, (t) => equalIgnoreCase(t.type, 'project'));

// Global and relations quick adds do not depend on context. Also, projects slice is not depend on context.
const needGlobalAcid = (busName, sliceDefinition) =>
    isProjectsSlice(sliceDefinition) || isGlobalOrRelationsBus(busName);

const getAcid = (configurator, busName, sliceDefinition) =>
    needGlobalAcid(busName, sliceDefinition) ? getGlobalAcid() : getStoredAcid(configurator);

const getApplicationContext = (configurator, params) => {

    const contextService = configurator.getApplicationContextService();
    const def = new Deferred();

    contextService.getApplicationContext(params, {success: def.resolve});

    return def.promise();

};

export const getProcesses = (configurator, busName, initData) => {

    const sliceDefinition = getSliceDefinition(initData);

    return getAcid(configurator, busName, sliceDefinition)
        .then(({acid}) => getApplicationContext(configurator, {acid}))
        .then(({processes}) => processes);

};
