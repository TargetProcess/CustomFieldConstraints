import {filter, memoize, pluck, reject, isString} from 'underscore';
import {isEnabled} from 'tp3/api/featureToggling/v1';

import {isGeneral} from 'utils';
import store from 'services/store';
import store2 from 'services/store2';

const systemCustomFieldsEnabled = () => isEnabled('systemCustomFields');

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

    const fields = isGeneral({entityType}) ?
        getCustomFields(processId, entityType) : getCustomFields(null, entityType);

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

export const preloadParentEntityStates = (processes) => {

    const mayBeProcessIds = pluck(processes, 'id');
    const processIds = reject(mayBeProcessIds, (mayBeId) => mayBeId === null);

    return processIds.length ?
        store2.get('EntityState', {
            where: `parentEntityState == null and workflow.process.id in [${processIds.join()}]`,
            select: '{id,name,isInitial,isFinal,isDefaultFinal,isPlanned,' +
                'workflow:{workflow.id,process:{workflow.process.id}},' +
                'entityType:{entityType.name},subEntityStates:subEntityStates.Select(' +
                '{id,name,entityType:{entityType.name},isInitial,isFinal,isDefaultFinal,isPlanned})}'
        }).then((entityStates) => {

            const cache = preloadParentEntityStates.cache = preloadParentEntityStates.cache || [];

            processIds.forEach((id) => {

                cache[id] = filter(entityStates, (state) => state.workflow.process.id === id);

            });

            return cache;

        }) : store2.get('EntityState', {
            where: 'parentEntityState == null and process.id == null',
            select: '{id,name,isInitial,isFinal,isDefaultFinal,isPlanned,' +
                'workflow:{workflow.id,process:{id:null}},' +
                'entityType:{entityType.name},subEntityStates:subEntityStates.Select(' +
                '{id,name,entityType:{entityType.name},isInitial,isFinal,isDefaultFinal,isPlanned})}'
        }).then((entityStates) => {

            const cache = preloadParentEntityStates.cache = preloadParentEntityStates.cache || [];

            cache.null = entityStates;

            return cache;

        });

};

preloadParentEntityStates.getStates = (processId) => {

    const entityStates = preloadParentEntityStates.cache[processId];

    if (entityStates === void 0) {

        // Rare case (process not in context), load & save missed entity state.
        return preloadParentEntityStates([{id: processId}]).then((states) => states[processId]);

    }

    return entityStates;

};

export const loadSingleParentEntityState = memoize(({filter: whereFilter, field}, processId, entityType) => {

    return (processId !== null ?
        store2.get('EntityState', {
            where: `${field} == ${isString(whereFilter) ? `'${whereFilter}'` : whereFilter} ` +
                `and workflow.process.id in [${processId}] and entityType.name == '${entityType.name}' ` +
                `and parentEntityState != null`,
            select: `{parentEntityState.${field}}`
        }) : store2.get('EntityState', {
            where: `${field} == ${isString(whereFilter) ? `'${whereFilter}'` : whereFilter} ` +
                `and entityType.name=='${entityType.name}' ` +
                `and parentEntityState != null`,
            select: `{parentEntityState.${field}}`
        }))
        .then(([parentEntityState]) => parentEntityState && parentEntityState[field] || null);

}, ({filter: whereFilter, field}, processId, entityType) =>
    `${isString(whereFilter) ? `'${whereFilter}'` : whereFilter}:${field}:${processId}:${entityType.name}`);

export const loadParentEntityStates = (processId) => preloadParentEntityStates.getStates(processId);

export const resetLoadersCache = () => {

    preloadParentEntityStates.cache = [];
    loadSingleParentEntityState.cache = [];
    getCustomFields.cache = [];
    loadCustomFields.cache = [];
    loadTeamsData.cache = [];
    loadTeamProjects.cache = [];

};
