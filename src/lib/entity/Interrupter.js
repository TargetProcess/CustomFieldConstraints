var $ = require('jQuery');
var _ = require('Underscore');
var Class = require('tau/core/class');

var CFConstraintsInterrupter = Class.extend({

    init: function(dataProvider, requirements, requireEntityCFsCallback) {
        this.dataProvider = dataProvider;
        this.requirements = requirements;
        this.requireEntityCFsCallback = requireEntityCFsCallback;
    },

    subscribe: function() {
        var entityTypesToInterrupt = this.requirements.getEntityTypesToInterrupt();
        var interrupter = this._getInterrupter();

        _.forEach(entityTypesToInterrupt, (entityTypeToInterrupt) => {
            interrupter.interruptSave(entityTypeToInterrupt, (interruptedActionDeferred, entitiesChanges) => {

                var changesToHandle = this._filterChangesToHandle(entitiesChanges);

                if (!changesToHandle.length) {

                    interruptedActionDeferred.resolve();
                    return;

                }

                this._processChangesToHandle(changesToHandle, entityTypeToInterrupt, interruptedActionDeferred);

            });
        });
    },

    _throwNotImplemented: function() {
        throw new Error('Not implemented');
    },

    _getInterrupter: function() {
        this._throwNotImplemented();
    },

    _filterChangesToHandle: function(entitiesChanges) {
        return _.filter(entitiesChanges, (entityChanges) => {
            return _.some(entityChanges.changes, (change) => {
                return this._shouldChangeBeHandled(change);
            }) && entityChanges.id;
        });
    },

    _shouldChangeBeHandled: function() {
        this._throwNotImplemented();
    },

    _processChangesToHandle: function(changesToHandle, entityTypeToInterrupt, interruptedActionDeferred) {

        var changedEntitiesIds = this._getChangedEntitiesIds(changesToHandle);

        $.when(
                this.dataProvider.getEntitiesDetailsPromise(changedEntitiesIds, entityTypeToInterrupt),
                this.dataProvider.getDefaultProcessPromise()
            )
        .then((entitiesDetailed, defaultProcess) => {
            return this._buildEntitiesWithRequirements(entitiesDetailed, changesToHandle, defaultProcess);
        })
        .done((entitiesWithRequirements) => {
            this._handleEntitiesRequirements(entitiesWithRequirements, interruptedActionDeferred);
        });
    },

    _getChangedEntitiesIds: function(changes) {
        return _.map(changes, (change) => {
            return this._getChangedEntityId(change);
        }).join(',');
    },

    _getChangedEntityId: function() {
        this._throwNotImplemented();
    },

    _buildEntitiesWithRequirements: function() {
        this._throwNotImplemented();
    },

    _handleEntitiesRequirements: function(entitiesWithRequirements, interruptedActionDeferred) {

        var iterateEntitiesToRequire = (entitiesToRequire, index) => {

            var entityIndex = index || 0;
            var entityToRequire = entitiesToRequire[entityIndex];
            if (!entityToRequire) {
                interruptedActionDeferred.resolve();
                return;
            }

            var requiredCFs = this._getEntityRequiredCFs(entityToRequire);

            if (!requiredCFs.length) {
                iterateEntitiesToRequire(++entityIndex);
                return;
            }

            this._requireEntityCFs(entityToRequire, requiredCFs)
                .done(() => {
                    iterateEntitiesToRequire(++entityIndex);
                })
                .fail(interruptedActionDeferred.reject);
        };

        iterateEntitiesToRequire(entitiesWithRequirements);
    },

    _requireEntityCFs: function(entityToRequire, customFields) {

        var requireEntityCFsDeferred = new $.Deferred();

        this.requireEntityCFsCallback({
            ...entityToRequire,
            customFields
        }, requireEntityCFsDeferred);

        return requireEntityCFsDeferred.promise();

    }
});

module.exports = CFConstraintsInterrupter;
