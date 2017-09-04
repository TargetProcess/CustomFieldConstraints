import {filter, memoize, pluck, reject} from 'underscore';

import {isGeneral} from 'utils';
import store from 'services/store';
import store2 from 'services/store2';

const systemCustomFieldsEnabled = () => window.tauFeatures && window.tauFeatures.systemCustomFields;

export const getCustomFields = memoize((processId, entityType) => {

    const fieldsToSelect = [
        'required', 'name', 'id', 'config', 'fieldType', 'value', 'numericPriority', 'entityType', 'process'
    ];

    if (systemCustomFieldsEnabled()) {

        fieldsToSelect.push('isSystem');

    }

    return store2.get('CustomField', {
        where: `process.id == ${processId || 'null'} and entityType.name == "${entityType.name}"`,
        select: `new(${fieldsToSelect.join(', ')})`
    });

}, (processId, entityType) => processId + entityType.name);

export const loadCustomFields = memoize((processId, entityType) => {

    let fields;

    if (isGeneral({entityType})) {

        fields = getCustomFields(processId, entityType);

    } else {

        fields = getCustomFields(null, entityType);

    }

    const isCalculated = (cf) => cf.config && cf.config.calculationModel;
    const isSystem = systemCustomFieldsEnabled() ?
        (cf) => cf.isSystem :
        () => false;

    return fields.then((items) => items.filter((cf) => !isSystem(cf) && !isCalculated(cf)));

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
                }, {
                    entityType: ['name']
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

    const mayBeProcessIds = pluck(processes, 'id');
    const processIds = reject(mayBeProcessIds, (mayBeId) => mayBeId === null);

    return processIds.length !== 0 ?
        store.get('EntityStates', {
            include: getEntityStatesIncludes(),
            where: `Workflow.Process.id in (${processIds.join()})`
        }).then((entityStates) => {

            const cache = preloadEntityStates.cache = preloadEntityStates.cache || [];

            processIds.forEach((id) => {

                cache[id] = filter(entityStates, (state) => state.workflow.process.id === id);

            });

            return cache;

        }) : [];

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
