import $, {when, Deferred, whenList} from 'jquery';
import {find, object, flatten, compose, constant, unique, map, last, without, memoize, reject, keys} from 'underscore';

import {addBusListener} from 'targetprocess-mashup-helper/lib/events';

import decodeSliceValue from 'utils/decodeSliceValue';
import {inValues, equalIgnoreCase, isAssignable, SLICE_CUSTOMFIELD_PREFIX} from 'utils';

import store from 'services/store';

import {getCustomFieldsForAxes} from 'services/axes';

const loadProject = memoize((projectId) =>
    store.get('Projects', projectId, {
        include: ['Process']
    }));

const onRender = (configurator, componentBusName, cb) => {

    const afterRenderHandler = function(e) {

        const element = e.data.element;
        const componentBus = this; // eslint-disable-line no-invalid-this, consistent-this

        cb(element, componentBus);

    };

    configurator.getComponentBusRegistry().getByName(componentBusName).then((bus) => {

        bus.on('afterRender', afterRenderHandler, null, null, 9999);

    });

};

const createTemplateItemFromCustomField = (customField) => ({
    type: 'CustomField',
    config: customField.config,
    caption: customField.name,
    fieldType: customField.fieldType,
    processId: customField.process ? customField.process.id : null,
    required: true,
    options: {
        ...customField
    }
});

const events = ['afterInit:last', 'before_dataBind'];

const onDataBind = (componentBusName, cb) =>
    addBusListener(componentBusName, events.join(' + '), (e) => {

        const initData = e.afterInit.data;
        const bindData = e.before_dataBind.data;
        const settingsData = e['settings.ready'] ? e['settings.ready'].data : void 0;

        const types = keys(bindData.types);

        // looks like some sort of race conditions which breaks form with this entity types
        if (inValues(types, ['UserProjectAllocation', 'TeamProjectAllocation'])) return;

        e.before_dataBind.suspendMain();

        const next = (customFields = []) => {

            customFields.forEach((v) => {

                let formItems = bindData.types[v.entityType.name].template.items;

                formItems = reject(formItems, (vv) => vv.type === 'CustomField' && vv.caption === v.name);
                formItems = formItems.concat(createTemplateItemFromCustomField(v));

                bindData.types[v.entityType.name].template.items = formItems;

            });
            e.before_dataBind.resumeMain();

        };
        const configurator = initData.config.context.configurator;

        cb(next, configurator, initData, bindData, settingsData);

    });

const getSliceDefinition = ({config}) =>
    (config.options && config.options.slice) ? config.options.slice.config.definition : null;

const getTargetValue = ({config}, axisName) =>
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
        type: 'entitystate',
        targetValue: '_Initial'
    }];

    const sliceDefinition = getSliceDefinition(initData);

    const axes = ['x', 'y'].reduce((res, axisName) => {

        const axisDefinition = sliceDefinition ? sliceDefinition[axisName] : null;

        if (!axisDefinition) return res;

        if (inValues(axisDefinition.types, 'entitystate')) {

            return res.concat({
                type: 'entitystate',
                targetValue: getTargetValue(initData, axisName)
            });

        }

        // to get process if one of axis is project
        if (inValues(axisDefinition.types, 'project')) {

            return res.concat({
                type: 'project',
                targetValue: getTargetValue(initData, axisName)
            });

        }

        const customFieldName = find(axisDefinition.types, (v) => v.match(SLICE_CUSTOMFIELD_PREFIX));

        if (customFieldName) {

            return res.concat({
                type: 'customfield',
                customFieldName: customFieldName.replace(SLICE_CUSTOMFIELD_PREFIX, ''),
                targetValue: getTargetValue(initData, axisName)
            });

        }

        return res;

    }, []);

    if (isAssignable({entityType}) || equalIgnoreCase(entityType.name, 'impediment')) {

        return unique(axes.concat(defaultAssignableAxes), (v) => v.type);

    }
    else return axes;

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

const findCustomFieldElByName = ($el, name) => $el.find(`[data-iscf=true][data-fieldname="${name}"]`);
const hideCustomFieldEl = ($cfEl) => {

    $cfEl.parent().removeClass('show');
    $cfEl.parent().addClass('hide');
    $cfEl.parent().find('input, select').toArray().forEach((v) =>
        $(v).data('validate').rules = without($(v).data('validate').rules, 'required'));

};

const showCustomFieldEl = ($cfEl) => {

    $cfEl.parent().addClass('show');
    $cfEl.parent().removeClass('hide');
    $cfEl.parent().find('input, select').toArray().forEach((v) =>
        $(v).data('validate').rules = $(v).data('validate').rules.concat('required'));

};

const applyActualCustomFields = ($el, allCustomFields, actualCustomFields) => {

    allCustomFields.forEach((v) => hideCustomFieldEl(findCustomFieldElByName($el, v.name)));
    actualCustomFields.forEach((v) => showCustomFieldEl(findCustomFieldElByName($el, v.name)));

};

const collectValues = ($el, customFields) =>
    object(customFields.map((v) => [v.name, findCustomFieldElByName($el, v.name).val()]));

const findFormByEntityType = ($el, entityType) =>
    $($el.find('.tau-control-set').toArray().filter((v) => equalIgnoreCase($(v).data('type'), entityType.name)));

const onCustomFieldsChange = ($el, customFields, handler) =>
    customFields.map((v) =>
        findCustomFieldElByName($el, v.name).on('change, input', compose(handler, constant(void 0))));

const getProjectValue = ($el) => {

    const $select = $el.find('.project');

    if (!$select.length) return null;

    return parseInt($select.val(), 10);

};

const getActiveProcess = ($el, axes) => {

    let projectId = getProjectValue($el);

    if (!projectId) {

        const projectAxis = find(axes, (v) => v.type === 'project');

        projectId = projectAxis.targetValue;

    }

    if (!projectId) return null;

    return when(loadProject(projectId))
        .then((project) => project.process)
        .fail(() => null);

};

const onProcessChange = ($el, axes, handler) =>
    $el.find('.project').on('change, input', () => {

        setTimeout(() =>
            when(getActiveProcess($el, axes))
                .then(handler), 1); // some quick add magic

    });

const listenQuickAddComponentBusForEntityType = (configurator, busName, config, axes, processes, entityType, onFieldsReady) => {

    let allCustomFields = [];
    let activeCustomFields = [];
    let actualValues = {};

    onRender(configurator, busName, ($elCommon, componentBus) => {

        const $el = findFormByEntityType($elCommon, entityType);
        const adjust = () => componentBus.fire('adjustPosition');

        const handler = (actualProcess, values = {}) => {

            if (!actualProcess) return when(applyActualCustomFields($el, allCustomFields, [])).then(adjust);

            return when(getCustomFieldsForAxes(config, axes, [actualProcess], {entityType}, values, {skipValuesCheck: false}))
                .then((customFieldsToShow) => {

                    activeCustomFields = customFieldsToShow;
                    applyActualCustomFields($el, allCustomFields, activeCustomFields);

                })
                .then(adjust);

        };

        setTimeout(() =>
            when(getActiveProcess($el, axes))
                .then(handler), 1); // some quick add magic

        onCustomFieldsChange($el, allCustomFields, () => {

            actualValues = collectValues($el, activeCustomFields);
            when(getActiveProcess($el, axes))
                .then((process) => handler(process, actualValues));

        });

        onProcessChange($el, axes, (process) => handler(process, actualValues));

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

        getCustomFieldsForAxes.resetCache();

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

    const entityTabsQuickAddBusName = 'entity quick add';

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
        },
        {
            busName: entityTabsQuickAddBusName
        }
    ];

    componentsConfig.forEach((componentConfig) => {

        applyToComponent(mashupConfig, componentConfig);

    });

};
