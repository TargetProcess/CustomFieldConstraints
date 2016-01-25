import {when, Deferred} from 'jquery';
import {object, map, find, unique, pluck} from 'underscore';

import SystemSliceInterrupter from 'tp3/mashups/sliceinterrupter';

import decodeSliceValue from 'utils/decodeSliceValue';
import store from 'services/store';
import {getCustomFieldsNamesForNewState} from 'services/customFieldsRequirements';

import {equalIgnoreCase, equalByShortcut, isUser, isGeneral} from 'utils';

const getEntityStateChange = (sliceChange) => find(sliceChange.changes, (v) => v.name.toLowerCase() === 'entitystate');

const filterSliceChanges = (sliceChanges) => sliceChanges.filter((v) => v.id && getEntityStateChange(v));

const getEntitiesFromSliceChanges = (sliceChanges) => sliceChanges.map((v) => ({
    id: parseInt(decodeSliceValue(v.id), 10),
    entityType: {
        name: v.type
    },
    entityState: {
        name: decodeSliceValue(getEntityStateChange(v).value)
    }
}));

const getProcessId = (entity) => isUser(entity) ? null : entity.project.process.id;

const createFullChanges = (entitiesFromSliceChanges) =>
    entitiesFromSliceChanges.map((smallEntity) => ({
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

    return find(entityStates, (entityState) =>
        equalIgnoreCase(target.name, entityState.name) || equalByShortcut(target.name.toLowerCase(), entityState));

};

const loadEntityStatesToFullChanges = (fullChanges) => {

    const processIds = unique(pluck(fullChanges, 'processId'));

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
        where: `Process.Id in (${processIds.join(',')})`
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

const loadFullChanges = (entitiesFromSliceChanges) =>
    when(createFullChanges(entitiesFromSliceChanges))
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

    const systemSliceInterrupter = new SystemSliceInterrupter();

    const entityTypesNamesToInterrupt = getEntityTypesNamesFromConfig(config);

    entityTypesNamesToInterrupt.forEach((entityTypeName) => {

        systemSliceInterrupter.interruptSave(entityTypeName, (def, sliceChanges) => {

            const resolve = def.resolve;
            const reject = def.reject;
            const entitiesFromSliceChanges = getEntitiesFromSliceChanges(filterSliceChanges(sliceChanges));

            if (!entitiesFromSliceChanges.length) {

                resolve();
                return;

            }

            when(loadFullChanges(entitiesFromSliceChanges))
            .then((fullChanges) => getRequirements(config, fullChanges))
            .then((requirements) => processRequirements(requirements, next, resolve, reject))
            .fail(() => resolve());

        });

    });

};
