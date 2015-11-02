var _ = require("underscore");


export default class CFConstraintsRequirements {

    constructor(cfConstraintsConfig) {
        this.config = cfConstraintsConfig;
    }

    getConfig() {
        return this.config;
    }

    getEntityTypesToInterrupt() {
        var types = _.reduce(this.config, function(entityTypesMemo, rule) {
            return entityTypesMemo.concat(_.keys(rule.constraints));
        }, []);

        return _.uniq(types);
    }

    getRequiredCFsForState(entityWithRequirements) {
        var entityTypeCFConstraintsRule = this.getEntityTypeCFConstraintsRule(entityWithRequirements);

        if (!entityTypeCFConstraintsRule) {
            return [];
        }

        var stateCFConstraints = entityTypeCFConstraintsRule.entityStates;

        var requiredCFConstraints = _.filter(stateCFConstraints, function(stateCFConstraint) {
            return stateCFConstraint.name.toLowerCase() === entityWithRequirements.requirementsData.newState.name.toLowerCase();
        });

        return this._getRequiredCFs(entityWithRequirements, requiredCFConstraints);
    }

    getRequiredCFsForCFs(entityWithRequirements) {
        var entityCFConstraints = this.getEntityCFConstraints(entityWithRequirements);

        if (!entityCFConstraints) {
            return [];
        }

        var requiredCFConstraints = _.reduce(entityWithRequirements.requirementsData.changedCFs, function(cfConstraintsMemo, changedCF) {
            var cfConstraints = _.filter(entityCFConstraints, function(entityCFConstraint) {
                return entityCFConstraint.name.toLowerCase() === changedCF.name.toLowerCase()
                    && (entityCFConstraint.valueIn
                    ? _.some(entityCFConstraint.valueIn, function(value) {
                    return value === changedCF.value;
                })
                    : _.every(entityCFConstraint.valueNotIn, function(value) {
                    return value !== changedCF.value;
                }))
            });
            return cfConstraintsMemo.concat(cfConstraints);
        }, []);

        return this._getRequiredCFs(entityWithRequirements, requiredCFConstraints);
    }

    getEntityTypeCFConstraintsRule(entityWithRequirements) {
        var processCFConstraintsRule = this.getProcessCFConstraintsRule(entityWithRequirements);

        if (!processCFConstraintsRule) {
            return null;
        }

        return processCFConstraintsRule.constraints[entityWithRequirements.entity.entityType.name.toLowerCase()];
    }

    getEntityCFConstraints(entityWithRequirements) {
        var entityTypeCFConstraintsRule = this.getEntityTypeCFConstraintsRule(entityWithRequirements);
        return entityTypeCFConstraintsRule ? entityTypeCFConstraintsRule.customFields : null;
    }

    getProcessCFConstraintsRule(entityWithRequirements) {
        return _.find(this.config,
            function(constraint) {
                return Number(constraint.processId) === Number(entityWithRequirements.processId);
            });
    }

    _getRequiredCFs(entityWithRequirements, requiredCFConstraints) {
        var requiredCFs = _.reduce(requiredCFConstraints, function(requiredCFsMemo, cfConstraint) {
            var requiredCFsByConstraint = _.filter(entityWithRequirements.entity.customFields, function(cf) {
                return _.find(cfConstraint.requiredCustomFields, function(requiredCF) {
                    return cf.name.toLowerCase() === requiredCF.toLowerCase() && (!cf.value || cf.value.toString() === '');
                });
            });
            return requiredCFsMemo.concat(requiredCFsByConstraint);
        }, []);

        return _.uniq(requiredCFs);
    }
}
