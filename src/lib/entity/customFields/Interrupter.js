var $ = require('jQuery');
var _ = require('Underscore');

var CFConstraintsInterrupter = require('./../Interrupter');

var CFConstraintsCFInterrupter = CFConstraintsInterrupter.extend({
    init: function(dataProvider, requirements, requireEntityCFsCallback) {
        this._super(dataProvider, requirements, requireEntityCFsCallback);
    },

    _getEntityRequiredCFs: function(entityToRequire) {
        return this.requirements.getRequiredCFsForCFs(entityToRequire);
    },

    _buildEntitiesWithRequirements: function(entitiesDetailed, changesToHandle, defaultProcess) {

        var EntitiesWithRequirementsDeferred = new $.Deferred();

        var entitiesWithRequirements = _.map(entitiesDetailed, (entity) => {
            return {
                entity: entity,
                processId: this.dataProvider.getEntityProcessId(entity, defaultProcess),
                requirementsData: {
                    changedCFs: this._getCFsChanges(entity, changesToHandle)
                }
            };
        });

        EntitiesWithRequirementsDeferred.resolve(entitiesWithRequirements);
        return EntitiesWithRequirementsDeferred.promise();
    }
});

module.exports = CFConstraintsCFInterrupter;
