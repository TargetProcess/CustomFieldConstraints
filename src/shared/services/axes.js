import {when, whenList} from 'jquery';
import {isObject, find, flatten, pluck, partial, omit, some, unique} from 'underscore';

import {inValues, equalByShortcut, equalIgnoreCase, isAssignable, isStateRelated} from 'utils';
import {
    loadCustomFields,
    preloadEntityStates,
    loadEntityStates,
    loadTeamsData,
    loadTeamProjects,
    resetLoadersCache
} from 'services/loaders';
import {
    getCustomFieldsNamesForNewState,
    getCustomFieldsNamesForChangedCustomFields,
    getCustomFieldsNamesForChangedCustomFieldsWithDependent
} from 'services/customFieldsRequirements';

const findInRealCustomFields = (customFieldsNames, realCustomFields) =>
    customFieldsNames.reduce((res, v) => {

        const realCustomField = find(realCustomFields, (field) => equalIgnoreCase(field.name, v));

        return realCustomField ? res.concat(realCustomField) : res;

    }, []);

const getRealCustomFields = (customFieldsNames, processId, entityType) => {

    if (!customFieldsNames.length) return [];

    return when(loadCustomFields(processId, entityType))
    .then((realCustomFields) => findInRealCustomFields(customFieldsNames, realCustomFields));

};

const matchTeamWorkflowEntityStateFlat = (valueToMatch, entityState) =>
    some(pluck(valueToMatch, 'entityState'), (v) => v && v.id === entityState.id);

const matchEntityStateFlat = (valueToMatch, entityType, entityState) => {

    const isTeamWorkflowEntityState = isObject(valueToMatch);

    return isTeamWorkflowEntityState ?
        matchTeamWorkflowEntityStateFlat(valueToMatch, entityState) :
        equalIgnoreCase(valueToMatch, entityState.name) || equalByShortcut(valueToMatch, entityState);

};

const matchEntityStateHeirarchy = (valueToMatch, entityType, entityState) => {

    const match = partial(matchEntityStateFlat, valueToMatch, entityType);

    return match(entityState) || entityState.subEntityStates.items.some(match);

};

// Mashup is configured for parent workflow entity state.
const getRootEntityState = (entityState) => {

    const parentEntityState = entityState ?
        entityState.parentEntityState : null;

    return !parentEntityState ?
        entityState : parentEntityState;

};

const getRealEntityState = (targetValue, processId, entityType) =>
    when(loadEntityStates(processId))
    .then((states) => {

        const entityStateFinder = targetValue.id ?
            (v) => v.id === targetValue.id :
            (v) => matchEntityStateFlat(targetValue, entityType, getRootEntityState(v));
        const entityState = find(states, entityStateFinder);

        return getRootEntityState(entityState);

    });

const getRealEntityStateByWorkflow = (targetValue, entityStates, entityType, workflows) => {

    const workflowIds = pluck(workflows, 'id');
    const entityState = find(entityStates, (v) =>
        inValues(workflowIds, v.workflow.id) && matchEntityStateHeirarchy(targetValue, entityType, v));

    return getRootEntityState(entityState);

};

const getRealCustomField = (customFieldName, processId, entityType) =>
    when(getRealCustomFields([customFieldName], processId, entityType))
        .then((items) => items.length ? items[0] : null);

const getRealEntityStateByTeam = (targetValue, processId, entity) => {

    if (targetValue.id) return getRealEntityState(targetValue, processId, entity.entityType);

    if (!isAssignable(entity)) return null;

    const entityType = entity.entityType;
    const canLoadTeamsData = entity.id !== void 0;

    return canLoadTeamsData ?
        when(loadEntityStates(processId), loadTeamsData(entity))
        .then((entityStates, fullEntity) => {

            const teamProjects = fullEntity.project ? fullEntity.project.teamProjects.items : [];
            const assignedTeams = fullEntity.assignedTeams.items;
            const project = fullEntity.project;

            return when(entityStates, assignedTeams, project, loadTeamProjects(pluck(teamProjects, 'id')));

        })
        .then((entityStates, assignedTeams, project, teamProjects) => {

            const workflows = assignedTeams.reduce((res, v) => {

                const team = v.team;
                const teamProject = find(teamProjects, (vv) =>
                    vv.project.id === project.id && vv.team.id === team.id);

                if (!teamProject) return res;

                const workflow = find(teamProject.workflows.items, (vv) =>
                    equalIgnoreCase(vv.entityType.name, entity.entityType.name));

                return workflow ? res.concat(workflow) : res;

            }, []);

            return getRealEntityStateByWorkflow(targetValue, entityStates, entityType, workflows);

        }) : getRealEntityState(targetValue, processId, entityType);

};

const getRealTargetValue = (axis, targetValue, processId, entity) => {

    if (axis.type === 'entitystate') {

        return getRealEntityState(targetValue, processId, entity.entityType);

    }

    if (axis.type === 'customfield') {

        return getRealCustomField(axis.customFieldName, processId, entity.entityType);

    }

    if (axis.type === 'assignedteams' || axis.type === 'teamentitystate') {

        return getRealEntityStateByTeam(targetValue, processId, entity);

    }

};

const getCustomFieldsForAxis = (config, axis, processes, entity, values = {}, options = {skipValuesCheck: false}, initialValues = {}) => {

    let cfs = [];
    const targetValue = axis.targetValue;

    return processes
        .reduce((res, process) =>
            res
                .then(() => getRealTargetValue(axis, targetValue, process.id, entity))
                .then((realTargetValue) => {

                    if (!realTargetValue) return [];

                    if (isStateRelated(axis.type)) {

                        return getCustomFieldsNamesForNewState(realTargetValue, config, process, entity.entityType.name, values, initialValues, options);

                    }

                    if (axis.type === 'customfield') {

                        if (axis.checkDependent && targetValue === null) {

                            const fullValues = omit(values, realTargetValue.name);

                            return getCustomFieldsNamesForChangedCustomFieldsWithDependent([realTargetValue.name], entity.entityState ? entity.entityState : null, config, process, entity.entityType.name, fullValues, initialValues, options);

                        } else {

                            const fullValues = {
                                ...values,
                                [realTargetValue.name]: targetValue
                            };

                            return getCustomFieldsNamesForChangedCustomFields([realTargetValue.name], config, process, entity.entityType.name, fullValues, initialValues, options);

                        }

                    }

                    return [];

                })
                .then((customFieldsNames) => getRealCustomFields(customFieldsNames, process.id, entity.entityType))
                .then((customFields) => {

                    cfs = cfs.concat(customFields);

                })

        , when([]))
        .then(() => cfs);

};

export const getCustomFieldsForAxes = (config, axes, processes, entity, values = {}, options = {}, initialValues = {}) =>
    whenList(axes.map((axis) => getCustomFieldsForAxis(config, axis, processes, entity, values, options, initialValues)))
        .then((...args) => flatten(args))
        .then((customFields) => {

            const allCustomFields = unique(customFields, (customField) => customField.id);

            // e.g. if we have state and cf axes and state axes requires same cf
            if (axes.length > 1) {

                const customFieldsAsAxes = axes.reduce((res, axis) => (axis.type === 'customfield') ? res.concat(axis.customFieldName) : res, []);

                return allCustomFields.filter((v) => !inValues(customFieldsAsAxes, v.name));

            } else return allCustomFields;

        });

getCustomFieldsForAxes.resetCache = () => resetLoadersCache();

getCustomFieldsForAxes.preloadEntityStates = (processes) => preloadEntityStates(processes);
