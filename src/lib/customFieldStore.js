import {when, Deferred} from 'jquery';
import {object, map, find, unique, pluck} from 'underscore';

import SystemStoreInterrupter from 'tp3/mashups/storage';

import store from 'services/store';
import {getCustomFieldsNamesForChangedCustomFields} from 'services/customFieldsRequirements';

import {equalIgnoreCase, isGeneral, isUser} from 'utils';

const getEntityStateChange = (sliceChange) => find(sliceChange.changes, (v) => equalIgnoreCase(v.name, 'customfields'));

const filterSliceChanges = (sliceChanges) => sliceChanges.filter((v) => v.id && getEntityStateChange(v));

const getEntitiesFromSliceChanges = (sliceChanges) => sliceChanges.map((v) => ({
    id: v.id,
    entityType: {
        name: v.type
    },
    customFields: (getEntityStateChange(v).value)
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

const loadFullChanges = (entitiesFromSliceChanges) =>
    when(createFullChanges(entitiesFromSliceChanges))
    .then(loadEntitiesToFullChanges);

const getEntityRequirements = (config, {entity, to, processId}) => {

    const changedCustomFieldsNames = pluck(to.customFields, 'name');
    const changedCustomFieldsValues = object(to.customFields.map((v) => [v.name, v.value]));

    const customFieldsNames = getCustomFieldsNamesForChangedCustomFields(changedCustomFieldsNames, config, processId, entity.entityType.name, changedCustomFieldsValues);

    return {
        entity,
        processId,
        requirementsData: {
            changedCFs: to.customFields,
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

        systemStoreInterrupter.interruptSave(entityTypeName, (def, sliceChanges) => {

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
