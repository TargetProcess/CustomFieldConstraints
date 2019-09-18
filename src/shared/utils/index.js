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

const shortcutValues = ['_initial', '_final', '_planned'];

export const isShortcut = (shortcut) => inValues(shortcutValues, String(shortcut));

const generalValues = [
    'General',
    'Assignable',
    'InboundAssignable',
    'OutboundAssignable',
    'PortfolioEpic',
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
];

export const isGeneral = (entity) => inValues(generalValues, entity.entityType.name);

const assignableValues = [
    'Assignable',
    'InboundAssignable',
    'OutboundAssignable',
    'PortfolioEpic',
    'Epic',
    'Feature',
    'UserStory',
    'Task',
    'Bug',
    'TestPlan',
    'TestPlanRun',
    'Request'
];

export const isAssignable = (entity) => inValues(assignableValues, entity.entityType.name);

const requesterValues = [
    'Requester'
];

export const isRequester = (entity) => inValues(requesterValues, entity.entityType.name);

const userValues = [
    'GeneralUser',
    'User',
    'Requester'
];

export const isUser = (entity) => inValues(userValues, entity.entityType.name);

export const getEntityTypesNamesFromConfig = (config) =>
    unique(config.reduce((res, processEntry) => res.concat(Object.keys(processEntry.constraints)), []));

export const SLICE_CUSTOMFIELD_PREFIX = /^ddl(multipleselectionlist)?/;

const relatedStateValues = ['entitystate', 'assignedteams', 'teamentitystate'];

export const isStateRelated = (name) => inValues(relatedStateValues, name);

export const CustomFieldsUpdateState = {
    Skipped: 0,
    Partial: 1
};
