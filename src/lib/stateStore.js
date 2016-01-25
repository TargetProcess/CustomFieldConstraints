import {when, Deferred} from 'jquery';
import {object, map, find, unique, pluck} from 'underscore';

import SystemStoreInterrupter from 'tp3/mashups/storage';

import store from 'services/store';
import {getCustomFieldsNamesForNewState} from 'services/customFieldsRequirements';

import {isGeneral, isUser, equalIgnoreCase} from 'utils';

const getEntityStateChange = (sourceChange) => find(sourceChange.changes, (v) => equalIgnoreCase(v.name, 'entitystate'));

const filterChanges = (changes) => changes.filter((v) => v.id && getEntityStateChange(v));

const getEntitiesFromChanges = (changes) => changes.map((v) => ({
    id: v.id,
    entityType: {
        name: v.type
    },
    entityState: (getEntityStateChange(v).value)
}));

const getProcessId = (entity) => isUser(entity) ? null : entity.project.process.id;

const createFullChanges = (entitiesFromChanges) =>
    entitiesFromChanges.map((smallEntity) => ({
        entity: {},
        to: smallEntity,
        processId: null
    }));

const loadAssignables = (fullChanges) => {

    const entities = fullChanges.filter((v) => isGeneral(v.to));

    if (!entities.length) return [];

    const ids = pluck(pluck(entities, 'to'), 'id');

    const where = `Id in (${ids.join(',')})`;

    const include = [
        {
            Project: [{
                Process: ['Id']
            }]
        },
        'EntityState',
        'EntityType',
        'CustomFields'
    ];

    return store.get('Assignables', {
        include,
        where
    });

};

const loadUsers = (fullChanges) => {

    const entities = fullChanges.filter((v) => isUser(v.to));

    if (!entities.length) return [];

    const ids = pluck(pluck(entities, 'to'), 'id');

    const where = `Id in (${ids.join(',')})`;

    const include = [
        'CustomFields'
    ];

    return store.get('Users', {
        include,
        where
    });

};

const loadEntitiesToFullChanges = (fullChanges) => {

    const changesHash = object(map(fullChanges, (v) => [v.to.id, v]));

    return when(loadAssignables(fullChanges), loadUsers(fullChanges))
        .then((assingables, users) => assingables.concat(users))
        .then((fullEntities) => {

            return fullEntities.map((fullEntity) => {

                const change = changesHash[fullEntity.id];

                return {
                    ...change,
                    entity: fullEntity,
                    processId: getProcessId(fullEntity)
                };

            });

        });

};

const getEntityState = (fullChange, entityStates) => {

    const target = fullChange.to.entityState;

    return find(entityStates, (entityState) => target.id === entityState.id);

};

const loadEntityStatesToFullChanges = (fullChanges) => {

    const entityStatesIds = unique(fullChanges.map((v) => v.to.entityState.id));

    return store.get('EntityStates', {
        include: [{
            workflow: ['Id']
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
        where: `Id in (${entityStatesIds.join(',')})`
    })
    .then((entityStates) => {

        return fullChanges.map((v) => ({
            ...v,
            to: {
                ...v.to,
                entityState: getEntityState(v, entityStates)
            }
        }));

    });

};

const loadFullChanges = (entitiesFromChanges) =>
    when(createFullChanges(entitiesFromChanges))
    .then(loadEntitiesToFullChanges)
    .then(loadEntityStatesToFullChanges);

const getEntityRequirements = (config, {entity, to, processId}) => {

    const customFieldsNames = getCustomFieldsNamesForNewState(to.entityState, config, processId, entity.entityType.name);

    return {
        entity,
        processId,
        requirementsData: {
            newState: to.entityState,
            customFieldsNames
        }
    };

};

const getRequirements = (config, entitiesChanges) =>
    entitiesChanges
    .map((change) => getEntityRequirements(config, change))
    .filter((v) => v.requirementsData.customFieldsNames.length);

const processRequirements = (requirements, next, resolve, reject) => {

    const all = requirements.reduce((res, requirement) => {

        return res.then(() => {

            const def = new Deferred();

            next(requirement, def);

            return def.promise();

        });

    }, when(true));

    when(all).then(resolve, reject);

};

const getEntityTypesNamesFromConfig = (config) =>
    unique(config.reduce((res, processEntry) => res.concat(Object.keys(processEntry.constraints)), []));

export default (config, next) => {

    const systemStoreInterrupter = new SystemStoreInterrupter();

    const entityTypesNamesToInterrupt = getEntityTypesNamesFromConfig(config);

    entityTypesNamesToInterrupt.forEach((entityTypeName) => {

        systemStoreInterrupter.interruptSave(entityTypeName, (def, changes) => {

            const resolve = def.resolve;
            const reject = def.reject;

            const entitiesFromChanges = getEntitiesFromChanges(filterChanges(changes));

            if (!entitiesFromChanges.length) {

                resolve();
                return;

            }

            when(loadFullChanges(entitiesFromChanges))
            .then((fullChanges) => getRequirements(config, fullChanges))
            .then((requirements) => processRequirements(requirements, next, resolve, reject))
            .fail(() => resolve());

        });

    });

};
