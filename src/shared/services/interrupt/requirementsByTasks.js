import {find} from 'underscore';
import {when} from 'jquery';

import store from 'services/store';
import {equalIgnoreCase} from 'utils';

const loadEntityState = (id) =>
    store.get('EntityStates', id, {
        include: ['isFinal']
    });

const getIsFinalStateByTargetValue = (entityState) => {

    if (equalIgnoreCase(entityState, '_final')) return true;

    if (entityState.id) {

        return when(loadEntityState(entityState.id))
            .then((fullEntityState) => fullEntityState.isFinal);

    }

};

const getEntitiesFromTasks = (tasks) =>
    tasks.filter((v) => !v.entityState.isFinal)
        .map((v) => ({
            entity: v,
            axes: [{
                type: 'entitystate',
                targetValue: '_final'
            }]
        }));

const loadTasks = (userStory) =>
    store.get('Tasks', {
        include: [
            'EntityType',
            {
                EntityState: ['isFinal']
            }
        ],
        where: `UserStory.id eq ${userStory.id}`
    });

export const createRequirementsByTasks = ({entity, axes}) => {

    if (equalIgnoreCase(entity.entityType.name, 'userstory')) {

        const entityStateAxis = find(axes, (v) => v.type === 'entitystate');

        if (entityStateAxis) {

            return when(getIsFinalStateByTargetValue(entityStateAxis.targetValue))
                .then((isFinal) => {

                    if (isFinal) {

                        return when(loadTasks(entity))
                        .then((tasks) => getEntitiesFromTasks(tasks));

                    }

                    return [];

                });

        }

    }

    return [];

};
