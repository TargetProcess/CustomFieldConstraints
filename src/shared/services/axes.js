import {when, whenList} from 'jquery';
import {isArray, isNumber, isString, find, flatten, pluck, partial, unique} from 'underscore';

import {inValues, equalByShortcut, equalIgnoreCase, isAssignable, isShortcut, isStateRelated} from 'utils';
import {
    loadCustomFields,
    preloadParentEntityStates,
    loadSingleParentEntityState,
    loadParentEntityStates,
    loadTeamsData,
    loadTeamProjects,
    resetLoadersCache
} from 'services/loaders';
import {
    getCustomFieldsNamesForNewState,
    getCustomFieldsNamesForChangedCustomFields,
    getCustomFieldsNamesForChangedCustomFieldsWithDependent
} from 'services/customFieldsRequirements';
import * as CustomFieldValue from 'services/CustomFieldValue';

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

const matchEntityStateFlat = (valueToMatch, entityType, entityState) => {

    if (!equalIgnoreCase(entityState.entityType.name, entityType.name)) {

        return false;

    }

    return isNumber(valueToMatch) ?
        valueToMatch === entityState.id :
        equalIgnoreCase(valueToMatch.name || valueToMatch, entityState.name) ||
        equalByShortcut(valueToMatch, entityState);

};

const matchEntityStateHierarchy = (valueToMatch, entityType, entityState) => {

    const match = partial(matchEntityStateFlat, valueToMatch, entityType);

    return match(entityState) || entityState.subEntityStates.some(match);

};

const getRealEntityState = (targetValue, processId, entityType) =>
    when(loadParentEntityStates(processId))
    .then((states) => {

        const entityStateFinder = targetValue.id ?
            (v) => v.id === targetValue.id :
            (v) => matchEntityStateFlat(targetValue, entityType, v);

        return find(states, entityStateFinder);

    });

const getRealEntityStateByWorkflow = (targetValue, entityStates, entityType, workflows) => {

    const workflowIds = pluck(workflows, 'id');

    return find(entityStates, (v) =>
        inValues(workflowIds, v.workflow.id) && matchEntityStateHierarchy(targetValue, entityType, v));

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
        when(loadParentEntityStates(processId), loadTeamsData(entity))
        .then((entityStates, fullEntity) => {

            const teamProjects = fullEntity.project ? fullEntity.project.teamProjects.items : [];
            const assignedTeams = fullEntity.assignedTeams.items;
            const project = fullEntity.project;

            return when(entityStates, assignedTeams, project, loadTeamProjects(pluck(teamProjects, 'id')));

        })
        .then((entityStates, assignedTeams, project, teamProjects) => {

            const rootWorkflows = assignedTeams.reduce((res, v) => {

                const team = v.team;
                const teamProject = find(teamProjects, (vv) =>
                    vv.project.id === project.id && vv.team.id === team.id);

                if (!teamProject) return res;

                const workflow = find(teamProject.workflows.items, (vv) =>
                    equalIgnoreCase(vv.entityType.name, entity.entityType.name));

                return workflow ? res.concat(workflow.parentWorkflow || workflow) : res;

            }, []);

            return getRealEntityStateByWorkflow(targetValue, entityStates, entityType, rootWorkflows);

        }) : getRealEntityState(targetValue, processId, entityType);

};

const getRootTargetQuery = (targetValue, entityState) => {

    if (isShortcut(targetValue)) {

        return {filter: null, field: null};

    }

    const targetIsArray = isArray(targetValue);
    // New entity state id from slice or new entity state object from store.
    let filter = targetValue.id || targetIsArray && (pluck(targetValue, 'entityState')[0] || {}).id;
    let field;

    if (isNumber(filter)) {

        field = 'id';

    } else if (isString(targetValue)) {

        // Slice send entity state name here.
        filter = targetValue;
        field = 'name';

    } else if (targetIsArray && pluck(targetValue, 'team').length) {

        // Add new team with custom workflow, select current entity state.
        filter = entityState.id;
        field = 'id';

    } else {

        filter = field = null;

    }

    return {filter, field};

};

// Mashup uses entity states from default workflow in rules, so find default entity state for target one.
const getRootTargetValue = (targetValue, processId, {entityType, entityState}) => {

    const query = getRootTargetQuery(targetValue, entityState);

    // Raw entity state source, pass as is.
    if (query.filter === null || query.field === null) {

        return when(targetValue);

    }

    return loadSingleParentEntityState(query, processId, entityType)
        .then((parentEntityState) => parentEntityState || {[query.field]: query.filter});

};

const getRealTargetValue = (axis, targetValue, processId, entity) => {

    if (axis.type === 'entitystate') {

        return getRootTargetValue(targetValue, processId, entity)
            .then((rootValue) => getRealEntityState(rootValue, processId, entity.entityType));

    }

    if (axis.type === 'customfield') {

        return getRealCustomField(axis.customFieldName, processId, entity.entityType);

    }

    if (axis.type === 'assignedteams' || axis.type === 'teamentitystate') {

        return getRootTargetValue(targetValue, processId, entity)
            .then((rootValue) => getRealEntityStateByTeam(rootValue, processId, entity));

    }

};

const getCustomFieldsForAxis = (config, axis, processes, entity, values = {}, options = {skipValuesCheck: false},
                                initialValues = {}) => {

    let cfs = [];
    const targetValue = axis.targetValue;

    return processes
        .reduce((res, process) =>
            res
                .then(() => getRealTargetValue(axis, targetValue, process.id, entity))
                .then((realTargetValue) => {

                    if (!realTargetValue) return [];

                    if (isStateRelated(axis.type)) {

                        return getCustomFieldsNamesForNewState(realTargetValue, config, process, entity.entityType.name,
                            values, initialValues, options);

                    }

                    if (axis.type === 'customfield') {

                        if (axis.checkDependent && (targetValue === null ||
                            CustomFieldValue.isEmptyCheckboxValue(targetValue))) {

                            return getCustomFieldsNamesForChangedCustomFieldsWithDependent([realTargetValue.name],
                                entity.entityState ? entity.entityState : null, config, process, entity.entityType.name,
                                values, initialValues, options);

                        } else {

                            const fullValues = {
                                ...values,
                                [realTargetValue.name]: targetValue
                            };

                            return getCustomFieldsNamesForChangedCustomFields([realTargetValue.name], config, process,
                                entity.entityType.name, fullValues, initialValues, options);

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

export const getCustomFieldsForAxes = (config, axes, processes, entity, values = {}, options = {},
                                       initialValues = {}) =>
    whenList(axes.map((axis) => getCustomFieldsForAxis(config, axis, processes, entity, values, options,
        initialValues)))
        .then((...args) => flatten(args))
        .then((customFields) => {

            const allCustomFields = unique(customFields, (customField) => customField.id);

            // e.g. if we have state and cf axes and state axes requires same cf
            if (axes.length > 1) {

                const customFieldsAsAxes = axes.reduce((res, axis) => (axis.type === 'customfield') ?
                    res.concat(axis.customFieldName) : res, []);

                return allCustomFields.filter((v) => !inValues(customFieldsAsAxes, v.name));

            } else return allCustomFields;

        });

getCustomFieldsForAxes.resetCache = () => resetLoadersCache();

getCustomFieldsForAxes.preloadParentEntityStates = (processes) => preloadParentEntityStates(processes);
