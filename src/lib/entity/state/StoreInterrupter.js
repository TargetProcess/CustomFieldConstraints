var _ = require('Underscore');
var Storage = require('tp3/mashups/storage');

var CFConstraintsStateInterrupter = require('./Interrupter');

var CFConstraintsStateInterrupterStore = CFConstraintsStateInterrupter.extend({

    _getInterrupter: function() {
        return new Storage();
    },

    _getChangedEntityId: function(change) {
        return change.id;
    },

    _getNewState: function(entity, entityStatesDetailed, changesToInterrupt) {
        var entityStateChange = _.find(changesToInterrupt, (change) => {
            return change.id === entity.id;
        });

        var change = _.find(entityStateChange.changes, (v) => {
            return this._shouldChangeBeHandled(v);
        });

        return this._getStateFromChange(entityStatesDetailed, change);
    },

    _getStateFromChange: function(entityStatesDetailed, change) {

        if (this._isTeamStateChange(change)) {

            var value = change.value;

            if (_.isArray(value) && value.length === 1 && value[0].entityState) {

                return this._getTeamStateFromChange(entityStatesDetailed, value[0].entityState.id);

            } else {

                return null;

            }

        } else {

            var newStateId = change.value.id;

            return _.find(entityStatesDetailed, (state) => {
                return state.id === newStateId;
            });

        }
    },

    _getTeamStateFromChange: function(entityStatesDetailed, teamStateId) {
        return _.find(entityStatesDetailed, (state) => {
            return _.some(state.subEntityStates, (sub) => {
                return sub.id === teamStateId;
            });
        });
    }
});

module.exports = CFConstraintsStateInterrupterStore;
