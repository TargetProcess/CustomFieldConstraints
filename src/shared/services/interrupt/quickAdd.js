import $, {when, Deferred, whenList} from 'jquery';
import {
    find, findLastIndex, object, flatten, compose, constant, unique,
    map, last, without, memoize, reject, keys, isString, some
} from 'underscore';

import {addBusListener} from 'targetprocess-mashup-helper/lib/events';

import {
    isSameEntityType, getAcid, getEntityTypes, getSliceDefinition, shouldIgnoreAxes
} from 'services/apiCompatibility';
import decodeSliceValue from 'utils/decodeSliceValue';
import {inValues, equalIgnoreCase, isAssignable, SLICE_CUSTOMFIELD_PREFIX} from 'utils';
import {busNames} from 'services/busNames';

import store from 'services/store';

import {getCustomFieldsForAxes} from 'services/axes';

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

const getCustomFieldProcessId = (customField) => customField.process ? customField.process.id : null;

const isTemplateForCustomField = (customField, template) => {

    const projectTemplate = find(template.items, (item) => item.id === 'Project');
    const processId = String(getCustomFieldProcessId(customField));

    return !projectTemplate ||
        some(projectTemplate.options.values, (project) => project.processId === processId);

};

const getCustomFieldTemplate = (customField, types) => {

    const typeOrTypes = types[customField.entityType.name];

    return typeOrTypes.template ||
        find(map(typeOrTypes, (type) => type.template), (template) => isTemplateForCustomField(customField, template));

};

const events = ['afterInit:last', 'before_dataBind'];

const injectCustomFieldTemplateItem = (items, injectedItem) => {

    const updatedItems = reject(items, (item) =>
        item.type === 'CustomField' &&
        item.caption === injectedItem.caption &&
        item.processId === injectedItem.processId);
    const relationsItemIndex = findLastIndex(updatedItems, (item) =>
        item.id === 'SlaveRelations:RelationType' || item.id === 'MasterRelations:RelationType');
    const injectedItemIndex = relationsItemIndex === -1 ? updatedItems.length : relationsItemIndex;

    updatedItems.splice(injectedItemIndex, 0, injectedItem);

    return updatedItems;

};

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

                const injectedItem = createTemplateItemFromCustomField(v);
                const template = getCustomFieldTemplate(v, bindData.types);

                template.items = injectCustomFieldTemplateItem(template.items, injectedItem);

            });
            e.before_dataBind.resumeMain();

        };
        const configurator = initData.config.context.configurator;

        cb(next, configurator, initData, bindData, settingsData);

    });

const getTargetValue = ({config}, axisName) =>
    decodeSliceValue(config.options.action ? config.options.action[axisName] : last(config.options.path));

const removeUnknownAxes = (axes) => reject(axes, (axis) => axis.targetValue === void 0);

const isTeamEntityStateAxis = (axes) =>
    some(axes, (a) => a.type === 'teamentitystate');

const useNewEntityStateAxis = ({entityType}) =>
    isAssignable({entityType}) ||
    equalIgnoreCase(entityType.name, 'impediment') ||
    equalIgnoreCase(entityType.name, 'project');

const getCustomAxes = (initData) => {

    const sliceDefinition = getSliceDefinition(initData);

    return ['x', 'y'].reduce((res, axisName) => {

        const axisDefinition = sliceDefinition ? sliceDefinition[axisName] : null;

        if (!axisDefinition) return res;

        const axisTypes = isString(axisDefinition) ? [axisDefinition] : axisDefinition.types;

        // to check entity state is the same as in config.
        if (inValues(axisTypes, 'entitystate')) {

            return res.concat({
                type: 'entitystate',
                targetValue: getTargetValue(initData, axisName)
            });

        }

        // to check team entity state is the same as in config.
        if (inValues(axisTypes, 'teamentitystate')) {

            return res.concat({
                type: 'teamentitystate',
                targetValue: getTargetValue(initData, axisName)
            });

        }

        // to get process if one of axis is project.
        if (inValues(axisTypes, 'project')) {

            return res.concat({
                type: 'project',
                targetValue: getTargetValue(initData, axisName)
            });

        }

        // to get process if one of axis is process.
        if (inValues(axisTypes, 'process')) {

            return res.concat({
                type: 'process',
                targetValue: getTargetValue(initData, axisName)
            });

        }

        const customFieldName = find(axisTypes, (v) => v.match(SLICE_CUSTOMFIELD_PREFIX));

        if (customFieldName) {

            return res.concat({
                type: 'customfield',
                customFieldName: customFieldName.replace(SLICE_CUSTOMFIELD_PREFIX, ''),
                targetValue: getTargetValue(initData, axisName)
            });

        }

        return res;

    }, []);

};

const getAxes = (busName, initData, entityType) => {

    const newEntityStateAxes = [{
        type: 'entitystate',
        targetValue: '_Initial'
    }];

    const axes = shouldIgnoreAxes(busName) ? [] : removeUnknownAxes(getCustomAxes(initData));

    if (useNewEntityStateAxis({entityType}) && !isTeamEntityStateAxis(axes)) {

        return unique(axes.concat(newEntityStateAxes), (v) => v.type);

    }
    else return axes;

};

const getApplicationContext = (configurator, params) => {

    const contextService = configurator.getApplicationContextService();
    const def = new Deferred();

    contextService.getApplicationContext(params, {success: def.resolve});

    return def.promise();

};

const getProcesses = (configurator, busName, initData) => {

    const sliceDefinition = getSliceDefinition(initData);

    return getAcid(configurator, busName, sliceDefinition)
        .then(({acid}) => getApplicationContext(configurator, {acid}))
        .then(({processes}) => processes);

};

const findCustomFieldElByName = ($el, name, processId) =>
    processId
    ? $el.find(`.cf-process_${processId} > [data-iscf=true][data-fieldname="${name}"]`)
    : $el.find(`[data-iscf=true][data-fieldname="${name}"]`);
const hideCustomFieldEl = ($cfEl) => {

    const $cfParent = $cfEl.parent();

    $cfParent.removeClass('show').addClass('hide');
    $cfParent.find('input, select').toArray().forEach((v) =>
        $(v).data('validate').rules = without($(v).data('validate').rules, 'required'));

};

const showCustomFieldEl = ($cfEl) => {

    const $cfParent = $cfEl.parent();

    $cfParent.addClass('show').removeClass('hide');
    $cfParent.find('input, select').toArray().forEach((v) =>
        $(v).data('validate').rules = $(v).data('validate').rules.concat('required'));

};

const applyActualCustomFields = ($el, allCustomFields, actualCustomFields) => {

    allCustomFields.forEach((v) => hideCustomFieldEl(findCustomFieldElByName($el, v.name, v.process ? v.process.id : null)));
    actualCustomFields.forEach((v) => showCustomFieldEl(findCustomFieldElByName($el, v.name, v.process ? v.process.id : null)));

};

const collectValues = ($el, customFields) =>
    object(customFields.map((v) => [v.name, findCustomFieldElByName($el, v.name, v.process ? v.process.id : null).val()]));

const findFormByEntityType = ($el, entityType) =>
    $($el.find('.tau-control-set').toArray().filter((v) => isSameEntityType(v, entityType)));

const onCustomFieldsChange = ($el, customFields, handler) =>
    customFields.map((v) =>
        findCustomFieldElByName($el, v.name).on('change input', compose(handler, constant(void 0))));

const getSelectValue = ($el, selector) => {

    const $select = $el.find(selector);

    if (!$select.length) return null;

    return parseInt($select.val(), 10);

};

const getProcessValue = ($el) => {

    return getSelectValue($el, '.process');

};

const getProjectValue = ($el) => {

    return getSelectValue($el, '.project');

};

const getAxis = (axes, axisType) => find(axes, (v) => v.type === axisType);

const loadProject = memoize((projectId) =>
    store.get('Projects', projectId, {
        include: ['Process']
    }));

const loadProcessByProject = (projectId) =>
    when(loadProject(projectId))
        .then((project) => project.process)
        .fail(() => null);

const loadProcess = memoize((processId) =>
    store.get('Processes', processId, {}));

const loadProcessDirect = (processId) =>
    when(loadProcess(processId))
        .then((process) => process)
        .fail(() => null);

const getProcessByAxis = (axes, {type, loader}) => {

    const axis = getAxis(axes, type);

    if (!axis) return null;

    const axisValue = axis.targetValue;

    return loader(axisValue);

};

const getProcessByProjectAxis = (axes) => {

    return getProcessByAxis(axes, {type: 'project', loader: loadProcessByProject});

};

const getProcessByProcessAxis = (axes) => {

    return getProcessByAxis(axes, {type: 'process', loader: loadProcessDirect});

};

const getActiveProcess = ($el, axes) => {

    const processId = getProcessValue($el);

    if (processId) return loadProcessDirect(processId);

    const promise = getProcessByProcessAxis(axes);

    if (promise) return promise;

    const projectId = getProjectValue($el);

    if (projectId) return loadProcessByProject(projectId);
    else return getProcessByProjectAxis(axes);

};

const onProcessChange = ($el, axes, handler) =>
    $el.find('.project, .process').on('change input', () => {

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

    when(getProcessByProjectAxis(axes))
    .then((process) => getCustomFieldsForAxes(config, axes, process ? [process] : processes, {entityType}, {}, {skipValuesCheck: true}))
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

        when(getProcesses(configurator, busName, initData))
        .then((processes) =>
            whenList(entityTypes.map((entityType) => {

                const def = new Deferred();

                const axes = getAxes(busName, initData, entityType);

                if (axes.length) listenQuickAddComponentBusForEntityType(configurator, busName, config, axes, processes, entityType, def.resolve);
                else def.resolve([]);

                return def.promise();

            })))
        .then((...args) => {

            const nonUniqueCustomFields = flatten(args);
            const customFields = unique(nonUniqueCustomFields, (customField) => customField.id);

            return next(customFields);

        })
        .fail(() => next());

    });

export default (mashupConfig) => {

    const componentsConfig = [
        {
            busName: busNames.TOP_LEFT_ADD_BUTTON_COMPONENT_BUS_NAME
        },
        {
            busName: busNames.VIEWBOARD_AND_ONE_BY_ONE_AND_TIMELINE_BUTTON_INSIDE_CELL_COMPONENT_BUS_NAME
        },
        {
            busName: busNames.VIEWBOARD_AND_TIMELINE_BUTTON_INSIDE_AXES_COMPONENT_BUS_NAME
        },

        {
            busName: busNames.VIEWLIST_BUTTON_COMPONENT_BUS_NAME
        },

        {
            busName: busNames.ENTITY_TABS_QUICK_ADD_BUS_NAME
        },
        {
            busName: busNames.RELATIONS_MASTER_TAB_COMPONENT_BUS_NAME
        },
        {
            busName: busNames.RELATIONS_SLAVE_TAB_COMPONENT_BUS_NAME
        }
    ];

    componentsConfig
        .forEach((componentConfig) => {

            applyToComponent(mashupConfig, componentConfig);

        });

};
