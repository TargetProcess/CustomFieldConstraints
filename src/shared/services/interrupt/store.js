import {flatten, find} from 'underscore';
import {when, whenList} from 'jquery';

import SystemStoreInterrupter from 'tp3/mashups/storage';

import {equalIgnoreCase, isStateRelated, lc} from 'utils';

import {createInterrupter} from './base';
import {createRequirementsByTasks} from './requirementsByTasks';
import {getCustomFieldValue} from 'services/CustomFieldValue';

const getEntityFromChange = (sourceChange, changeValues) => {

    const mainEntry = {
        entity: {
            id: sourceChange.id,
            entityType: {
                name: sourceChange.type
            }
        },
        axes: changeValues.reduce((res, v) => {

            if (equalIgnoreCase(v.name, 'customfields')) {

                return res.concat(v.value.map((vv) => ({
                    type: 'customfield',
                    customFieldName: vv.name,
                    targetValue: getCustomFieldValue(vv),
                    checkDependent: true
                })));

            }

            if (isStateRelated(v.name)) {

                return res.concat({
                    type: lc(v.name),
                    targetValue: v.value
                });

            }

            return res;

        }, []),
        replaceCustomFieldValueInChanges: (customFieldName, value) => {

            const customFields = find(changeValues, (v) => equalIgnoreCase(v.name, 'customfields'));

            if (!customFields) return;

            const change = find(customFields.value, (v) => equalIgnoreCase(v.name, customFieldName));

            if (change) change.value = value;

        }
    };

    return when(createRequirementsByTasks(mainEntry))
        .then((reqs) => [mainEntry].concat(reqs));

};

const getEntitiesFromChanges = (sourceChanges) =>
    whenList(sourceChanges.map((sourceChange) => getEntityFromChange(sourceChange, sourceChange.changes)))
    .then((...args) => flatten(args));

export default createInterrupter({
    systemInterrupter: new SystemStoreInterrupter(),
    getEntitiesFromChanges
});
