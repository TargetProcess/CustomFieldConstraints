import {filter, memoize, pluck} from 'underscore';

import {isGeneral} from 'utils';

import store from 'services/store';
import store2 from 'services/store2';

export const getCustomFields = memoize((processId, entityType) =>
    store2.get('CustomField', {
        take: 1000,
        where: `process.id == ${processId || 'null'} and entityType.name == "${entityType.name}"`,
        select: 'new(required, name, id, config, fieldType, value, numericPriority, entityType, process)'
    }), (processId, entityType) => processId + entityType.name);

export const loadCustomFields = memoize((processId, entityType) => {

    let fields;

    if (isGeneral({entityType})) {

        fields = getCustomFields(processId, entityType);

    } else {

        fields = getCustomFields(null, entityType);

    }

    return fields.then((items) => items.filter((v) => v.config ? !v.config.calculationModel : true));

}, (processId, entityType) => processId + entityType.name);

export const loadTeamsData = memoize((entity) =>
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
    }), (entity) => entity.entityType.name + entity.id);

export const loadTeamProjects = memoize((ids) => {

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

const getEntityStatesIncludes = () => {

    const entityStateIncludes = [{
        workflow: [
            'id', {
                process: ['id']
            }
        ]
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
        }];

    return entityStateIncludes.concat({
        parentEntityState: entityStateIncludes
    });

};

export const preloadEntityStates = (processes) => {

    const processIds = pluck(processes, 'id');

    return store.get('EntityStates', {
        include: getEntityStatesIncludes(),
        where: `Workflow.Process.id in (${processIds.join()})`
    }).then((entityStates) => {

        const cache = preloadEntityStates.cache = preloadEntityStates.cache || [];

        processIds.forEach((id) => {

            const states = filter(entityStates, (state) => state.workflow.process.id === id);

            cache[id] = states;

        });

        return cache;

    });

};

preloadEntityStates.getStates = (processId) => {

    const entityStates = preloadEntityStates.cache[processId];

    if (entityStates === void 0) {

        // Rare case (process not in context), load & save missed entity state.
        return preloadEntityStates([{id: processId}]).then((states) => states[processId]);

    }

    return entityStates;

};

export const loadEntityStates = (processId) => preloadEntityStates.getStates(processId);

export const resetLoadersCache = () => {

    preloadEntityStates.cache = [];
    getCustomFields.cache = [];
    loadCustomFields.cache = [];
    loadTeamsData.cache = [];
    loadTeamProjects.cache = [];

};
