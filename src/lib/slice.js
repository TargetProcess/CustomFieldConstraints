import {flatten} from 'underscore';
import {when, whenList} from 'jquery';

import SystemSliceInterrupter from 'tp3/mashups/sliceinterrupter';

import decodeSliceValue from 'utils/decodeSliceValue';

import {SLICE_CUSTOMFIELD_PREFIX, isStateRelated, lc} from 'utils';

import {createInterrupter} from './base';
import {createRequirementsByTasks} from './requirementsByTasks';

const getEntityFromChange = (sourceChange, changeValues) => {

    const mainEntry = {

        entity: {
            id: parseInt(decodeSliceValue(sourceChange.id), 10),
            entityType: {
                name: sourceChange.type
            }
        },
        axes: changeValues.reduce((res, v) => {

            if (v.name.match(SLICE_CUSTOMFIELD_PREFIX)) {

                return res.concat({
                    type: 'customfield',
                    customFieldName: v.name.replace(SLICE_CUSTOMFIELD_PREFIX, ''),
                    targetValue: decodeSliceValue(v.value)
                });

            }

            if (isStateRelated(v.name)) {

                return res.concat({
                    type: lc(v.name),
                    targetValue: decodeSliceValue(v.value)
                });

            }

            return res;

        }, [])
    };

    return when(createRequirementsByTasks(mainEntry))
        .then((reqs) => [mainEntry].concat(reqs));

};

const getEntitiesFromChanges = (sourceChanges) =>
    whenList(sourceChanges.map((sourceChange) => getEntityFromChange(sourceChange, sourceChange.changes)))
    .then((...args) => flatten(args));

export default createInterrupter({
    systemInterrupter: new SystemSliceInterrupter(),
    getEntitiesFromChanges
});
