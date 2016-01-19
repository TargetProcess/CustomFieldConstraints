var _ = require('Underscore');
var SliceInterrupter = require('tp3/mashups/sliceinterrupter');

var CFConstraintsStateInterrupter = require('./Interrupter');
var SliceDecoder = require('./../../SliceDecoder');

var CFConstraintsStateInterrupterSlice = CFConstraintsStateInterrupter.extend({

    init: function(dataProvider, requirements, requireEntityCFsCallback) {
        this._super(dataProvider, requirements, requireEntityCFsCallback);
        this.sliceDecoder = new SliceDecoder();
    },

    _getInterrupter: function() {
        return new SliceInterrupter();
    },

    _getChangedEntityId: function(change) {
        return this.sliceDecoder.decode(change.id);
    },

    _getNewState: function(entity, entityStatesDetailed, changesToInterrupt, defaultProcess, teamProjects) {

        var entityStateChange = _.find(changesToInterrupt, (change) => {
            return parseInt(this.sliceDecoder.decode(change.id), 10) === entity.id;
        }, this);

        return this._getEntityState(entity, entityStatesDetailed, entityStateChange.changes, defaultProcess, teamProjects);

    },

    _getEntityState: function(entity, entityStates, changes, defaultProcess, teamProjects) {

        var change = _.find(changes, (subChange) => {
            return this._shouldChangeBeHandled(subChange);
        });

        if (!change) return null;

        var stateName = this.sliceDecoder.decode(change.value);

        if (this._isTeamStateChange(change)) {

            return this._getTeamState(stateName, entity, entityStates, teamProjects);

        } else {

            return _.find(entityStates, (state) => {
                return state.process.id === this.dataProvider.getEntityProcessId(entity, defaultProcess)
                    && state.entityType.name === entity.entityType.name
                    && this.isStateEqual(stateName, state);
            });

        }
    },

    _getTeamState: function(stateName, entity, entityStates, teamProjects) {

        if (_.isEmpty(entity.assignedTeams)) return null;

        var workflowIds = _.compact(_.map(entity.assignedTeams, (teamAssignment) => {

            var teamId = teamAssignment.team.id;
            var teamProject = _.find(teamProjects, (subTeamProjects) => {
                return subTeamProjects.project.id === entity.project.id &&
                    subTeamProjects.team.id === teamId;
            });
            if (!teamProject) {
                return null;
            }
            return _.find(teamProject.workflows, (workflow) => {
                return workflow.entityType.name === entity.entityType.name;
            }).id;

        }));

        return _.find(entityStates, (state) => {
            if (this.isProperState(stateName, state, workflowIds)) {
                return true;
            }
            return _.some(state.subEntityStates, (sub) => {
                return this.isProperState(stateName, sub, workflowIds);
            });
        });

    },

    isProperState: function(stateName, state, workflowIds) {
        return _.contains(workflowIds, state.workflow.id) && this.isStateEqual(stateName, state);
    },

    isStateEqual: function(expectedStateName, actualState) {
        var lowerName = expectedStateName.toLowerCase();
        return (lowerName === actualState.name.toLowerCase()
            || (lowerName === '_initial' && actualState.isInitial)
            || (lowerName === '_final' && actualState.isFinal)
            || (lowerName === '_planned' && actualState.isPlanned)
        );
    }
});

module.exports = CFConstraintsStateInterrupterSlice;
