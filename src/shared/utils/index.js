import {isArray, unique} from 'underscore';

export const lc = (s) => s.toLowerCase();

export const equalIgnoreCase = (a, b) => lc(String(a)) === lc(String(b));

export const equalByShortcut = (shortcut, entityState) => {

    return ({
        _initial: entityState.isInitial,
        _final: entityState.isFinal && entityState.isDefaultFinal,
        _planned: entityState.isPlanned
    })[lc(String(shortcut))] || false;

};

export const inValues = (values, value = '') => {

    if (isArray(value)) return value.some((v) => values.some((vv) => equalIgnoreCase(v, vv)));

    return values.some((v) => equalIgnoreCase(v, value));

};

export const isShortcut = (shortcut) => inValues(['_initial', '_final', '_planned'], String(shortcut));

export const isGeneral = (entity) => inValues([
    'General',
    'Assignable',
    'InboundAssignable',
    'OutboundAssignable',
    'Epic',
    'Feature',
    'UserStory',
    'Task',
    'Bug',
    'TestPlan',
    'TestPlanRun',
    'Request',
    'Project',
    'Program',
    'Release',
    'Iteration',
    'TeamIteration',
    'Team',
    'TestCase',
    'Build',
    'Impediment'
], entity.entityType.name);

export const isAssignable = (entity) => inValues([
    'Assignable',
    'InboundAssignable',
    'OutboundAssignable',
    'Epic',
    'Feature',
    'UserStory',
    'Task',
    'Bug',
    'TestPlan',
    'TestPlanRun',
    'Request'
], entity.entityType.name);

export const isRequester = (entity) => inValues([
    'Requester'
], entity.entityType.name);

export const isUser = (entity) => inValues([
    'GeneralUser',
    'User',
    'Requester'
], entity.entityType.name);

export const getEntityTypesNamesFromConfig = (config) =>
    unique(config.reduce((res, processEntry) => res.concat(Object.keys(processEntry.constraints)), []));

export const SLICE_CUSTOMFIELD_PREFIX = /^ddl(multipleselectionlist)?/;

export const isStateRelated = (name) => inValues(['entitystate', 'assignedteams', 'teamentitystate'], name);

export const CustomFieldsUpdateState = {
    Skipped: 0,
    Partial: 1
};
