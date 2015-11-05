var _ = require("Underscore");
var Storage = require("tp3/mashups/storage");
var ComponentEventListener = require("tp3/mashups/componenteventlistener");
var SliceDecoder = require("./CFConstraints.slice.decoder");
var Requirements = require("./CFConstraints.requirements");
var Class = require("tau/core/class");
var CFConstraintsQuickAdd = Class.extend({
    init: function(requirements) {
        this.requirements = requirements;
        this.sliceDecoder = new SliceDecoder();
    },

    getCFs: function(newValue, entityStates, process, entityType, dataBindEvtArg, customFields) {

        if (!newValue) {
            return [];
        }

        var requiredCFs = this._getRequiredCFs(newValue, entityStates, process, entityType, customFields);

        var result = [];

        if (requiredCFs.length > 0) {
            _.forEach(requiredCFs, function(cf) {
                var cfDefinition = _.find(customFields, function(processCF) {
                    return processCF.name.toLowerCase() == cf.name.toLowerCase();
                });

                if (!cfDefinition.required) {
                    result.push(cfDefinition);
                }
            }, this);
        }

        return result;
    },

    getChangedValue: function(afterInitEvtArg, settingsReadyEvtArg) {
        var sliceDefinition = this._getSliceDefinition(afterInitEvtArg);

        if (sliceDefinition && settingsReadyEvtArg) {
            return this._getAxisName(afterInitEvtArg, sliceDefinition, settingsReadyEvtArg, 'x')
                || this._getAxisName(afterInitEvtArg, sliceDefinition, settingsReadyEvtArg, 'y')
                || this._getAxisDefaultValue();
        }

        return this._getAxisDefaultValue();
    },

    _getRequiredCFs: function(newValue, entityStates, process, entityType, customFields) {
    },

    _getAxisValueName: function() {
    },

    _getAxisDefaultValue: function() {
    },

    _getNewAxisValue: function(axisValue, axisAction) {
    },

    _getAxisName: function(afterInitEvtArg, sliceDefinition, settingsReadyEvtArg, axisName) {

        const propertyName = this._getAxisValueName();

        if (sliceDefinition[axisName]
            && !this._compareArrays(sliceDefinition[axisName].types, settingsReadyEvtArg.types)
        ) {

            const isNewlist = !Boolean(afterInitEvtArg.config.options.action);
            let axisAction;
            let axisValue;

            if (isNewlist) {

                axisValue = axisName;
                axisAction = _.last(afterInitEvtArg.config.options.path);

            } else if (afterInitEvtArg.config.options.action[axisName]) {

                axisValue = _.find(sliceDefinition[axisName].types, function(type) {
                    return type.toLowerCase().indexOf(propertyName) == 0;
                });
                axisAction = afterInitEvtArg.config.options.action[axisName];

            }

            if (axisValue) return this._getNewAxisValue(axisValue, axisAction);

        }

        return null;

    },

    _getSliceDefinition: function(afterInitEvtArg) {
        return (afterInitEvtArg.config.options && afterInitEvtArg.config.options.slice) ? afterInitEvtArg.config.options.slice.config.definition : null;
    },

    _compareArrays: function(arrayNames1, array2) {
        var selectNames = function(array) {
            return _.map(array, function(el) {
                return el.name.toLowerCase();
            })
        };

        var arrayNames2 = selectNames(array2);

        return arrayNames1.length == array2.length
            && _.every(arrayNames1, function(el) {
            return _.contains(arrayNames2, el.toLowerCase());
        });
    }
});

module.exports = CFConstraintsQuickAdd;
