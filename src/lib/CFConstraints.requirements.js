import {isArray, keys, uniq, find, filter, reduce} from 'underscore';

const equalIgnoreCase = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
const inValues = (values, value = '') => {

    if (isArray(value)) {

        return value.some((v) => values.some((vv) => equalIgnoreCase(v, vv)));

    }

    return values.some((v) => equalIgnoreCase(v, value));

};

const checkChangedFieldByConstraint = (customField, constraint) => {

    if (!equalIgnoreCase(customField.name, constraint.name)) return false;

    if ('valueIn' in constraint) return inValues(constraint.valueIn, customField.value);
    if ('valueNotIn' in constraint) return !inValues(constraint.valueNotIn, customField.value);

    return false;

};

const findRequiredConstrainsByCfs = (constraints, customFields) =>
    customFields.reduce((res, changedCF) =>
        res.concat(constraints.filter((entityCFConstraint) =>
            checkChangedFieldByConstraint(changedCF, entityCFConstraint))), []);

export default class CFConstraintsRequirements {

    constructor(cfConstraintsConfig) {

        this.config = cfConstraintsConfig;

    }

    getConfig() {

        return this.config;

    }

    getEntityTypesToInterrupt() {

        const types = this.config.reduce((res, rule) => res.concat(keys(rule.constraints)), []);

        return uniq(types);

    }

    getRequiredCFsForState(entityWithRequirements) {

        const entityTypeCFConstraintsRule = this.getEntityTypeCFConstraintsRule(entityWithRequirements);

        if (!entityTypeCFConstraintsRule) return [];

        const stateCFConstraints = entityTypeCFConstraintsRule.entityStates;

        if (!stateCFConstraints) return [];

        const requiredCFConstraints = stateCFConstraints.filter((stateCFConstraint) =>
            equalIgnoreCase(stateCFConstraint.name, entityWithRequirements.requirementsData.newState.name));

        return this._getRequiredCFs(entityWithRequirements, requiredCFConstraints);

    }

    getRequiredCFsForCFs(entity) {

        const entityConstraints = this.getEntityCFConstraints(entity);
        const changedFields = entity.requirementsData.changedCFs;

        if (!entityConstraints) return [];

        const requiredConstraints = findRequiredConstrainsByCfs(entityConstraints, changedFields);

        return this._getRequiredCFs(entity, requiredConstraints);

    }

    getEntityTypeCFConstraintsRule(entityWithRequirements) {

        const processCFConstraintsRule = this.getProcessCFConstraintsRule(entityWithRequirements);

        if (!processCFConstraintsRule) return null;

        return processCFConstraintsRule.constraints[entityWithRequirements.entity.entityType.name.toLowerCase()];

    }

    getEntityCFConstraints(entityWithRequirements) {

        const entityTypeCFConstraintsRule = this.getEntityTypeCFConstraintsRule(entityWithRequirements);

        return entityTypeCFConstraintsRule ? entityTypeCFConstraintsRule.customFields : null;

    }

    getProcessCFConstraintsRule(entityWithRequirements) {

        return find(this.config, (constraint) =>
            Number(constraint.processId) === Number(entityWithRequirements.processId));

    }

    _getRequiredCFs(entityWithRequirements, requiredCFConstraints) {

        const requiredCFs = reduce(requiredCFConstraints, (res, cfConstraint) =>
            res.concat(filter(entityWithRequirements.entity.customFields, (cf) =>
                find(cfConstraint.requiredCustomFields, (requiredCF) =>
                    equalIgnoreCase(cf.name, requiredCF) && (!cf.value || cf.value.toString() === '')))), []);

        return uniq(requiredCFs);

    }
}
