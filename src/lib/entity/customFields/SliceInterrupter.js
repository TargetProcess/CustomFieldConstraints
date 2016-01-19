import {isString, flatten, partial, pluck} from 'underscore';

var SliceInterrupter = require('tp3/mashups/sliceinterrupter');

var CFConstraintsCFInterrupter = require('./Interrupter');
var SliceDecoder = require('./../../SliceDecoder');

var CFConstraintsCFInterrupterSlice = CFConstraintsCFInterrupter.extend({

    init: function(dataProvider, requirements, requireEntityCFsCallback) {

        this._super(dataProvider, requirements, requireEntityCFsCallback);
        this.sliceDecoder = new SliceDecoder();

    },

    _getInterrupter: function() {

        return new SliceInterrupter();

    },

    _shouldChangeBeHandled: function(change) {

        return change.name && change.name.match(/^ddl/i);

    },

    _getChangedEntityId: function(change) {

        return this.sliceDecoder.decode(change.id);

    },

    _getCFsChanges: function(entity, changesToHandle) {

        const decode = this.sliceDecoder.decode.bind(this.sliceDecoder);

        const dropdownNamePrefix = /^ddl/i;
        const multiselectNamePrefix = /^ddlmultipleselectionlist/i;

        const serverEmptyValue = 'na';

        const getId = (change) => parseInt(decode(change.id), 10);

        const findEntityChanges = (entity_, sliceChanges) =>
            flatten(pluck(sliceChanges.filter((change) => getId(change) === entity_.id), 'changes'));

        const extractField = (change) => {

            let name;
            let type;

            if (change.name.match(multiselectNamePrefix)) {

                name = change.name.replace(multiselectNamePrefix, '');
                type = 'multipleselectionlist';

            } else if (change.name.match(dropdownNamePrefix)) {

                name = change.name.replace(dropdownNamePrefix, '');
                type = 'dropdown';

            }

            return {name, type};

        };

        const processSliceServerValue = (value) => (value === serverEmptyValue) ? null : value;

        const processRestServerValue = (field, value) => {

            if (field.type.toLowerCase() === 'multipleselectionlist') return isString(value) ? value.split(',') : [];

            return value;

        };

        const extractValue = (change) => processSliceServerValue(decode(change.value));

        const extractChangedCustomFields = (sliceChanges) =>
            sliceChanges
                .filter((v) => v.name && (v.name.match(dropdownNamePrefix) || v.name.match(multiselectNamePrefix)))
                .map((v) => ({
                    ...extractField(v),
                    value: extractValue(v),
                    souceChange: v
                }));

        const intersectArrays = (arr1, arr2, fn) => arr1.filter((a) => arr2.find((b) => fn(a, b)));

        const normalizeValue = (v) => String(v).toLowerCase();

        const equalNormalizedValues = (v1, v2) => normalizeValue(v1) === normalizeValue(v2);

        const notMatchCustomFieldsValues = (changedCf, entityCf) => {

            if (!equalNormalizedValues(entityCf.name, changedCf.name) ||
                !equalNormalizedValues(entityCf.type, changedCf.type)) return false;

            if (changedCf.type === 'multipleselectionlist') {

                return !find(entityCf.value, partial(equalNormalizedValues, changedCf.value));

            } else {

                return !equalNormalizedValues(entityCf.value, changedCf.value);

            }

        };

        const extractExistingCustomFields = ({customFields}) => customFields.map((v) => ({
            ...v,
            type: v.type.toLowerCase(),
            value: processRestServerValue(v, v.value)
        }));

        const findExactChangedCustomFields = (changedCustomFields, existingCustomFields) =>
            intersectArrays(changedCustomFields, existingCustomFields, notMatchCustomFieldsValues);

        const entityChanges = findEntityChanges(entity, changesToHandle);

        const changedCustomFields = extractChangedCustomFields(entityChanges);
        const existingCustomFields = extractExistingCustomFields(entity);

        return findExactChangedCustomFields(changedCustomFields, existingCustomFields);

    }
});

module.exports = CFConstraintsCFInterrupterSlice;
