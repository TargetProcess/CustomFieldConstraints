var $ = require('jQuery');
var _ = require('Underscore');

var CFConstraintsInterrupter = require('./../Interrupter');

var CFConstraintsStateInterrupter = CFConstraintsInterrupter.extend({

    _shouldChangeBeHandled: function(change) {
        return change.name &&
            _.contains(['entitystate', 'assignedteams', 'teamentitystate'], change.name.toLowerCase());
    },

    _isTeamStateChange: function(change) {
        return change.name && _.contains(['assignedteams', 'teamentitystate'], change.name.toLowerCase());
    },

    _getEntityRequiredCFs: function(entityToRequire) {
        return this.requirements.getRequiredCFsForState(entityToRequire);
    },

    _buildEntitiesWithRequirements: function(entitiesDetailed, changesToHandle, defaultProcess) {
        var teamProjectsPromise = this.dataProvider.getTeamProjectsPromise(entitiesDetailed);
        var entityStatesDetailsPromise = this.dataProvider.getEntityStatesDetailsPromise(changesToHandle, entitiesDetailed, defaultProcess);
        var tasksDetailsPromise = this.dataProvider.getTasksDetailsPromise(entitiesDetailed);

        return $.when(teamProjectsPromise, entityStatesDetailsPromise, tasksDetailsPromise)
            .then((teamProjects, entityStatesDetailed, tasks) => {
                return this._getEntitiesWithRequirements(entitiesDetailed, entityStatesDetailed, changesToHandle,
                    defaultProcess, tasks, teamProjects);
            });
    },

    _getEntitiesWithRequirements: function(entitiesDetailed, entityStatesDetailed, changesToHandle, defaultProcess, tasks, teamProjects) {
        var entitiesToHandle = _.map(entitiesDetailed, (entity) => {
            var entities = [],
                newState = this._getNewState(entity, entityStatesDetailed, changesToHandle, defaultProcess, teamProjects);

            if (newState) {

                var entityToHandle = {
                    entity: entity,
                    processId: this.dataProvider.getEntityProcessId(entity, defaultProcess),
                    requirementsData: {
                        newState: newState
                    }
                };

                if (entity.entityType.name.toLowerCase() === 'userstory' && newState.isFinal) {
                    entities = entities.concat(this._getUserStoryTasksToHandle(entityToHandle, tasks, entityStatesDetailed, defaultProcess));
                }

                entities.push(entityToHandle);
            }

            return entities;
        });

        return _.flatten(entitiesToHandle, true);
    },

    _getUserStoryTasksToHandle: function(entityToHandle, tasks, entityStatesDetailed, defaultProcess) {
        var userStory = entityToHandle.entity;

        var entityTasks = _.filter(tasks, (task) => task.userStory.id === userStory.id);

        if (entityTasks.length === 0) {
            return [];
        }

        var taskNewState = _.find(entityStatesDetailed, (entityState) => {
            return entityState.isFinal
                && entityState.process.id === entityToHandle.processId
                && entityState.entityType.name.toLowerCase() === 'task';
        });

        return _.map(entityTasks, (task) => {
            return {
                entity: task,
                processId: this.dataProvider.getEntityProcessId(task, defaultProcess),
                requirementsData: {
                    newState: taskNewState
                }
            };
        });
    },

    _getNewState: function() {
        this._throwNotImplemented();
    }
});

module.exports = CFConstraintsStateInterrupter;
