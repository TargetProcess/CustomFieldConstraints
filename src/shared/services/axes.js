import {when, whenList} from 'jquery';
import {find, flatten, unique, memoize, pluck, partial} from 'underscore';

import {inValues, equalByShortcut, equalIgnoreCase, isGeneral, isAssignable, isStateRelated} from 'utils';
import store from 'services/store';
import store2 from 'services/store2';
import {
    getCustomFieldsNamesForNewState,
    getCustomFieldsNamesForChangedCustomFields
} from 'services/customFieldsRequirements';

const findInRealCustomFields = (customFieldsNames, realCustomFields) =>
    customFieldsNames.reduce((res, v) => {

        const realCustomField = find(realCustomFields, (field) => equalIgnoreCase(field.name, v));

        return realCustomField ? res.concat(realCustomField) : res;

    }, []);

const loadCustomFields = memoize((processId, entityType) => {

    if (isGeneral({entityType})) {

        return store2.get('CustomField', {
            take: 1000,
            where: `process.id == ${processId} and entityType.name == "${entityType.name}"`,
            select: 'new(required, name, id, config, fieldType, value, entityType, process)'
        });

    } else {

        return store2.get('CustomField', {
            take: 1000,
            where: `process.id == null and entityType.name == "${entityType.name}"`,
            select: 'new(required, name, id, config, fieldType, value, entityType, process)'
        });

    }

});

const getRealCustomFields = (customFieldsNames, processId, entityType) => {

    if (!customFieldsNames.length) return [];

    return when(loadCustomFields(processId, entityType))
    .then((realCustomFields) => findInRealCustomFields(customFieldsNames, realCustomFields));

};

const loadEntityStates = memoize((processId) =>
    store.get('EntityStates', {
        include: [{
            workflow: ['id']
        }, {
            process: ['id']
        }, {
            entityType: ['name']
        },
            'name',
            'isInitial',
            'isFinal',
            'isPlanned', {
                subEntityStates: [
                    'id',
                    'name', {
                        workflow: ['id']
                    },
                    'isInitial',
                    'isFinal',
                    'isPlanned'
                ]
            }
        ],
        where: `Process.Id in (${processId})`
    }));

const matchEntityStateFlat = (valueToMatch, entityType, entityState) =>
    equalIgnoreCase(entityState.entityType.name, entityType.name) &&
        (equalIgnoreCase(valueToMatch, entityState.name) || equalByShortcut(valueToMatch, entityState));

const matchEntityStateHeirarchy = (valueToMatch, entityType, entityState) => {

    const match = partial(matchEntityStateFlat, valueToMatch, entityType);

    return match(entityState) || entityState.subEntityStates.items.some(match);

};

const getRealEntityState = (targetValue, processId, entityType) =>
    when(loadEntityStates(processId))
    .then((items) =>
        targetValue.id ?
        find(items, (v) => v.id === targetValue.id) :
        find(items, (v) => matchEntityStateFlat(targetValue, entityType, v)));

const getRealCustomField = (customFieldName, processId, entityType) =>
    when(getRealCustomFields([customFieldName], processId, entityType))
        .then((items) => items.length ? items[0] : null);

const loadTeamsData = memoize((entity) =>
    store.get(entity.entityType.name, entity.id, {
        include: [{
            project: {
                process: ['id'],
                teamProjects: ['id']
            },
            assignedTeams: [
                'id',
                {
                    team: ['id']
                }
            ]
        }]
    }));

const loadTeamProjects = memoize((ids) => {

    if (!ids.length) return [];

    return store.get('TeamProjects', {
        include: [{
            team: ['id']
        }, {
            project: ['id']
        }, {
            workflows: ['id', 'name', {
                entityType: ['name']
            }, {
                parentWorkflow: ['id']
            }]
        }],
        where: `id in (${ids.join(',')})`
    });

});

const getRealEntityStateByTeam = (targetValue, processId, entity) => {

    if (targetValue.id) return getRealEntityState(targetValue, processId, entity.entityType);

    if (!isAssignable(entity)) return null;

    const entityType = entity.entityType;

    return when(loadEntityStates(processId), loadTeamsData(entity))
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

                const workflow = teamProject.workflows.items.find((vv) =>
                    equalIgnoreCase(vv.entityType.name, entity.entityType.name));

                return workflow ? res.concat(workflow) : res;

            }, []);

            const workflowIds = pluck(workflows, 'id');

            return entityStates.find((v) =>
                inValues(workflowIds, v.workflow.id) && matchEntityStateHeirarchy(targetValue, entityType, v));

        });

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
        .reduce((res, {id: processId}) =>
            res
                .then(() => getRealTargetValue(axis, targetValue, processId, entity))
                .then((realTargetValue) => {

                    if (!realTargetValue) return [];

                    if (isStateRelated(axis.type)) {

                        return getCustomFieldsNamesForNewState(realTargetValue, config, processId, entity.entityType.name, values, initialValues, options);

                    }

                    if (axis.type === 'customfield') {

                        const fullValues = {
                            ...values,
                            [realTargetValue.name]: targetValue
                        };

                        return getCustomFieldsNamesForChangedCustomFields([realTargetValue.name], config, processId, entity.entityType.name, fullValues, initialValues, options);

                    }

                    return [];

                })
                .then((customFieldsNames) => getRealCustomFields(customFieldsNames, processId, entity.entityType))
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

            const allCustomFields = unique(customFields, (v) => v.name);

            // e.g. if we have state and cf axes and state axes requires same cf
            const customFieldsAsAxes = axes.reduce((res, axis) => (axis.type === 'customfield') ? res.concat(axis.customFieldName) : res, []);

            return allCustomFields.filter((v) => !inValues(customFieldsAsAxes, v.name));

        });

getCustomFieldsForAxes.resetCache = () => {

    loadCustomFields.cache = [];
    loadEntityStates.cache = [];
    loadTeamsData.cache = [];
    loadTeamProjects.cache = [];

};
