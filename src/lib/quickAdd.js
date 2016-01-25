import $, {when, Deferred, whenList} from 'jquery';
import {find, object, flatten, memoize, compose, constant, unique, map, last, without} from 'underscore';

import {addBusListener} from 'targetprocess-mashup-helper/lib/events';

import decodeSliceValue from 'utils/decodeSliceValue';
import {inValues, equalByShortcut, equalIgnoreCase, isGeneral, isAssignable} from 'utils';
import store from 'services/store';
import store2 from 'services/store2';
import {getCustomFieldsNamesForNewState, getCustomFieldsNamesForChangedCustomFields} from 'services/customFieldsRequirements';

const onRender = (configurator, componentBusName, cb) => {

    const afterRenderHandler = function(e) {

        const element = e.data.element;
        const self = this;
        const componentBus = self;

        cb(element, componentBus);

    };

    configurator.getComponentBusRegistry().getByName(componentBusName).then((bus) => {
        bus.on('afterRender', afterRenderHandler);
    });

};

const createTemplateItemFromCustomField = (customField) => ({
    type: 'CustomField',
    config: customField.config,
    caption: customField.name,
    fieldType: customField.fieldType,
    processId: customField.process ? customField.process.id : null,
    required: true
});

const events = ['afterInit:last', 'before_dataBind'];

const onDataBind = (componentBusName, cb) =>
    addBusListener(componentBusName, events.join(' + '), (e) => {

        e.before_dataBind.suspendMain();

        const initData = e.afterInit.data;
        const bindData = e.before_dataBind.data;
        const settingsData = e['settings.ready'] ? e['settings.ready'].data : void 0;

        const next = (customFields = []) => {

            customFields.forEach((v) => bindData.types[v.entityType.name].template.items.push(createTemplateItemFromCustomField(v)));
            e.before_dataBind.resumeMain();

        };
        const configurator = initData.config.context.configurator;

        cb(next, configurator, initData, bindData, settingsData);

    });

const getSliceDefinition = ({config}) =>
    (config.options && config.options.slice) ? config.options.slice.config.definition : null;

const getTargetValue = ({config}, {name: axisName}) =>
    decodeSliceValue(config.options.action ? config.options.action[axisName] : last(config.options.path));

const getEntityTypes = (initData, bindData) => {

    if (bindData.types) {

        return map(bindData.types, (v) => ({
            name: v.entityType.name
        }));

    } else if (initData.addAction) {

        return initData.addAction.data.types.map((v) => ({
            name: v.name
        }));

    } else {

        const sliceDefinition = getSliceDefinition(initData);

        if (sliceDefinition) {

            return sliceDefinition.cells.types.map((v) => ({
                name: v.type
            }));

        }

    }

    return [];

};

const getAxes = (initData, entityType) => {

    const defaultAssignableAxes = [{
        name: 'x',
        type: 'entitystate',
        targetValue: '_Initial'
    }];

    const sliceDefinition = getSliceDefinition(initData);

    const axes = ['x', 'y'].reduce((res, axisName) => {

        const axisDefinition = sliceDefinition ? sliceDefinition[axisName] : null;

        if (!axisDefinition) return res;

        let axis;

        if (inValues(axisDefinition.types, 'entitystate')) {

            axis = {
                name: axisName,
                type: 'entitystate'
            };

        }

        const fieldPrefix = /^ddl(multipleselectionlist)?/;
        const customFieldName = find(axisDefinition.types, (v) => v.match(fieldPrefix));

        if (customFieldName) {

            axis = {
                name: axisName,
                type: 'customfield',
                customFieldName: customFieldName.replace(fieldPrefix, '')
            };

        }

        if (axis) {

            return res.concat({
                ...axis,
                targetValue: getTargetValue(initData, axis)
            });

        }

        return res;

    }, []);

    if (isAssignable({entityType})) return unique(axes.concat(defaultAssignableAxes), (v) => v.type);
    else return axes;

};

const loadEntityStates = memoize((processId) => {

    return store.get('EntityStates', {
        include: [{
            workflow: ['Id']
        }, {
            process: ['id']
        }, {
            entityType: ['name']
        },
            'name',
            'isInitial',
            'isFinal',
            'isPlanned', {
                subEntityStates: [
                    'id',
                    'name', {
                        workflow: ['id']
                    },
                    'isInitial',
                    'isFinal',
                    'isPlanned'
                ]
            }
        ],
        where: `Process.Id in (${processId})`
    });

});

const findInRealCustomFields = (customFieldsNames, realCustomFields) =>
    customFieldsNames.reduce((res, v) => {

        const realCustomField = find(realCustomFields, (field) => equalIgnoreCase(field.name, v));

        return realCustomField ? res.concat(realCustomField) : res;

    }, []);

const getRealCustomFields = memoize((customFieldsNames, processId, entityType) => {

    let customFields;

    if (isGeneral({entityType})) {

        customFields = store2.get('CustomField', {
            take: 1000,
            where: `process.id == ${processId} and entityType.name == "${entityType.name}"`,
            select: 'new(required, name, id, config, fieldType, value, entityType, process)'
        });

    } else {

        customFields = store2.get('CustomField', {
            take: 1000,
            where: `process.id == null and entityType.name == "${entityType.name}"`,
            select: 'new(required, name, id, config, fieldType, value, entityType, process)'
        });

    }

    return when(customFields)
    .then((realCustomFields) => findInRealCustomFields(customFieldsNames, realCustomFields));

});

const getRealEntityState = (targetValue, processId, entityType) =>
    when(loadEntityStates(processId))
    .then((items) =>
        find(items, (v) =>
            equalIgnoreCase(v.entityType.name, entityType.name) &&
            (equalIgnoreCase(targetValue, v.name) || equalByShortcut(targetValue, v))));

const getRealTargetValue = (axis, targetValue, processId, entity) => {

    if (axis.type === 'entitystate') {

        return getRealEntityState(targetValue, processId, entity.entityType);

    }

    if (axis.type === 'customfield') {

        return when(getRealCustomFields([axis.customFieldName], processId, entity.entityType))
        .then((items) => items.length ? items[0] : null);

    }

};

const getCustomFieldsForAxis = (config, axis, processes, entity, values = {}, options = {skipValuesCheck: false}) => {

    let cfs = [];
    const targetValue = axis.targetValue;

    return processes
        .reduce((res, {id: processId}) =>
            res
                .then(() => getRealTargetValue(axis, targetValue, processId, entity))
                .then((realTargetValue) => {

                    if (!realTargetValue) return [];

                    if (axis.type === 'entitystate') {

                        return getCustomFieldsNamesForNewState(realTargetValue, config, processId, entity.entityType.name, values, {}, options);

                    }

                    if (axis.type === 'customfield') {

                        const fullValues = {
                            ...values,
                            [realTargetValue.name]: targetValue
                        };

                        return getCustomFieldsNamesForChangedCustomFields([realTargetValue.name], config, processId, entity.entityType.name, fullValues, {}, options);

                    }

                })
                .then((customFieldsNames) => getRealCustomFields(customFieldsNames, processId, entity.entityType))
                .then((customFields) => {

                    cfs = cfs.concat(customFields);

                })

        , when([]))
        .then(() => cfs);

};

const getApplicationContext = (configurator, params) => {

    const contextService = configurator.getApplicationContextService();
    const def = new Deferred();

    contextService.getApplicationContext(params, {success: def.resolve});

    return def.promise();

};

const getProcesses = (configurator) => {

    const applicationStore = configurator.getAppStateStore();

    return when(applicationStore.get({fields: ['acid']}))
        .then(({acid}) => getApplicationContext(configurator, {acid}))
        .then(({processes}) => processes);

};

const findCustomFieldElByName = ($el, name) => $el.find(`[data-iscf=true][data-fieldname=${name}]`);
const hideCustomFieldEl = ($cfEl) => {

    $cfEl.parent().removeClass('show');
    $cfEl.data('validate').rules = without($cfEl.data('validate').rules, 'required');

};

const showCustomFieldEl = ($cfEl) => {

    $cfEl.parent().addClass('show');
    $cfEl.data('validate').rules = $cfEl.data('validate').rules.concat('required');

};

const applyActualCustomFields = ($el, allCustomFields, actualCustomFields) => {

    allCustomFields.forEach((v) => hideCustomFieldEl(findCustomFieldElByName($el, v.name)));
    actualCustomFields.forEach((v) => showCustomFieldEl(findCustomFieldElByName($el, v.name)));

};

const collectValues = ($el, customFields) =>
    object(customFields.map((v) => [v.name, findCustomFieldElByName($el, v.name).val()]));

const getCustomFieldsForAxes = (config, axes, processes, entity, values = {}, options = {}) =>
    whenList(axes.map((axis) => getCustomFieldsForAxis(config, axis, processes, entity, values, options)))
        .then((...args) => flatten(args))
        .then((customFields) => {

            const allCustomFields = unique(customFields, (v) => v.name);

            // e.g. if we have state and cf axes and state axes requires same cf
            const customFieldsAsAxes = axes.reduce((res, axis) => (axis.type === 'customfield') ? res.concat(axis.customFieldName) : res, []);

            return allCustomFields.filter((v) => !inValues(customFieldsAsAxes, v.name));

        });

const findFormByEntityType = ($el, entityType) =>
    $el.find('.tau-control-set').filter(function() {
        return equalIgnoreCase($(this).data('type'), entityType.name);
    });

const onCustomFieldsChange = ($el, customFields, handler) =>
    customFields.map((v) => findCustomFieldElByName($el, v.name).on('change, input', compose(handler, constant(void 0))));

const onProcessChange = ($el, handler) =>
    $el.find('.project').on('change, input', (e) => {

        const $select = $(e.currentTarget);
        const value = $select.val();
        const processId = parseInt($select.children().filter(`[value=${value}]`).data('option').processId, 10);

        setTimeout(() => handler({id: processId}), 1);

    });

const listenQuickAddComponentBusForEntityType = (configurator, busName, config, axes, processes, entityType, onFieldsReady) => {

    let allCustomFields = [];
    let activeCustomFields = [];
    let actualValues = {};

    onRender(configurator, busName, ($elCommon, componentBus) => {

        const $el = findFormByEntityType($elCommon, entityType);
        const adjust = () => componentBus.fire('adjustPosition');

        const handler = (actualProcesses = processes, values = {}) =>
            when(getCustomFieldsForAxes(config, axes, actualProcesses, {entityType}, values, {skipValuesCheck: false}))
                .then((customFieldsToShow) => {

                    activeCustomFields = customFieldsToShow;
                    applyActualCustomFields($el, allCustomFields, activeCustomFields);

                })
                .then(adjust);

        handler();

        onCustomFieldsChange($el, allCustomFields, () => {

            actualValues = collectValues($el, activeCustomFields);
            handler(processes, actualValues);

        });

        onProcessChange($el, (processData) => handler([processData], actualValues));

    });

    when(getCustomFieldsForAxes(config, axes, processes, {entityType}, {}, {skipValuesCheck: true}))
    .then((customFields) => {

        allCustomFields = customFields;

    })
    .then(() => onFieldsReady(allCustomFields))
    .fail(() => onFieldsReady([]));

};

const applyToComponent = (config, {busName}) =>
    onDataBind(busName, (next, configurator, initData, bindData) => {

        getRealCustomFields.cache = [];
        loadEntityStates.cache = [];

        const entityTypes = getEntityTypes(initData, bindData);

        when(getProcesses(configurator))
        .then((processes) =>
            whenList(entityTypes.map((entityType) => {

                const def = new Deferred();

                const axes = getAxes(initData, entityType);

                if (axes.length) listenQuickAddComponentBusForEntityType(configurator, busName, config, axes, processes, entityType, def.resolve);
                else def.resolve([]);

                return def.promise();

            }))
            .then((...args) => next(flatten(args))))
        .fail(() => next());

    });

export default (mashupConfig) => {

    const topLeftAddButtonComponentBusName = 'board plus quick add general';

    const viewBoardAndOnebyoneAndTimelineButtonInsideCellComponentBusName = 'board plus quick add cells';
    const viewBoardAndTimelineButtonInsideAxesComponentBusName = 'board axis quick add';

    const viewListButtonComponentBusName = 'board.cell.quick.add';

    const relationsTabComponentBusName = 'relations-quick-add-general';

    const componentsConfig = [
        {
            busName: topLeftAddButtonComponentBusName
        },
        {
            busName: viewBoardAndOnebyoneAndTimelineButtonInsideCellComponentBusName
        },
        {
            busName: viewBoardAndTimelineButtonInsideAxesComponentBusName
        },

        {
            busName: viewListButtonComponentBusName
        },

        {
            busName: relationsTabComponentBusName
        }
    ];

    componentsConfig.forEach((componentConfig) => {

        applyToComponent(mashupConfig, componentConfig);

    });

};
