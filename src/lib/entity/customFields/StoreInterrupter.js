import _, {isString} from 'Underscore';
var Storage = require('tp3/mashups/storage');

var CFConstraintsCFInterrupter = require('./Interrupter');

const processRestServerValue = (field, value) => {

    if (field.type && field.type.toLowerCase() === 'multipleselectionlist') return isString(value) ? value.split(',') : [];

    return value;

};

var CFConstraintsCFInterrupterStore = CFConstraintsCFInterrupter.extend({

    init: function(dataProvider, requirements, requireEntityCFsCallback) {
        this._super(dataProvider, requirements, requireEntityCFsCallback);
    },

    _getInterrupter: function() {
        return new Storage();
    },

    _shouldChangeBeHandled: function(change) {
        return change.name && change.name.toLowerCase() === 'customfields';
    },

    _getChangedEntityId: function(change) {
        return change.id;
    },

    _getCFsChanges: function(entity, changesToHandle) {

        var entityChanges = _.find(changesToHandle, (change) => change.id === entity.id);

        var cfsChangesToHandle = _.reduce(entityChanges.changes, (cfsChangesToHandleMemo, change) => {
            return this._shouldChangeBeHandled(change)
                ? cfsChangesToHandleMemo.concat(change.value)
                : cfsChangesToHandleMemo;
        }, []);

        return _.filter(cfsChangesToHandle, (changedCf) => {
            return _.find(entity.customFields, (cf) => {
                return changedCf.name === cf.name && changedCf.value !== cf.value;
            });
        })
        .map((entityCustomField) => ({
            ...entityCustomField,
            value: processRestServerValue(entityCustomField, entityCustomField.value)
        }));

    }

});

module.exports = CFConstraintsCFInterrupterStore;
