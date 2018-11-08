import $, {when, Deferred, whenList} from 'jquery';
import {
    compose, constant, difference, filter, find, findIndex, findLastIndex, flatten, indexBy, isString, keys, last, map,
    memoize, object, pick, reject, some, unique, union
} from 'underscore';

import {addBusListener} from 'targetprocess-mashup-helper/lib/events';

import decodeSliceValue from 'utils/decodeSliceValue';
import {inValues, equalIgnoreCase, isAssignable, SLICE_CUSTOMFIELD_PREFIX} from 'utils';

import {getEntityTypes, getSliceDefinition, shouldIgnoreAxes, getProcesses} from 'services/sliceApi';
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
    numericPriority: customField.numericPriority,
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

const findNewCustomFieldIndex = (items, newNumericPriority) => {

    const nextItemIndex = findIndex(items, (item) => item.numericPriority > newNumericPriority);

    if (nextItemIndex >= 0) {

        return nextItemIndex;

    }

    const relationsItemIndex = findLastIndex(items, (item) =>
        item.id === 'SlaveRelations:RelationType' || item.id === 'MasterRelations:RelationType');

    return relationsItemIndex === -1 ? items.length : relationsItemIndex;

};

const removeAlreadyInjectedCustomField = (items, injectedItem) =>
    reject(items, (item) =>
        item.type === 'CustomField' &&
        item.caption === injectedItem.caption &&
        item.processId === injectedItem.processId);

const injectCustomFieldTemplateItem = (items, injectedItem) => {

    const newItems = removeAlreadyInjectedCustomField(items, injectedItem);
    const injectedIndex = findNewCustomFieldIndex(newItems, injectedItem.numericPriority);

    newItems.splice(injectedIndex, 0, injectedItem);

    return newItems;

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

const hasTeamEntityStateAxis = (axes) =>
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

        // to get process if one of axes is project.
        if (inValues(axisTypes, 'project')) {

            return res.concat({
                type: 'project',
                targetValue: getTargetValue(initData, axisName)
            });

        }

        // to get process if one of axes is process.
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

    if (useNewEntityStateAxis({entityType}) && !hasTeamEntityStateAxis(axes)) {

        return unique(axes.concat(newEntityStateAxes), (v) => v.type);

    }
    else return axes;

};

const customCheckboxSelector = '.toggle-switch__input';  // Pesky new checkbox.

const findCustomFieldElByName = ($el, name, processId) => {

    const selector = `[data-iscf=true][data-fieldname="${name}"]`;
    const checkboxSelector = `${selector} ${customCheckboxSelector}`;

    if (processId) {

        const $cf = $el.find(`.cf-process_${processId} ${selector}`);

        return $cf.length
            ? $cf
            : $el.find(`.cf-process_${processId}${checkboxSelector}`);

    }

    const $cf = $el.find(selector);

    return $cf.length ? $cf : $el.find(checkboxSelector);

};

const getCustomFieldValue = ($cf, {fieldtype, value: dataValue} = {fieldtype: null}) => {

    if (equalIgnoreCase(fieldtype, 'entity')) {

        return {fieldValue: $cf.val(), dataValue};

    }

    if ($cf.is(':checkbox')) {

        return $cf.prop('checked');

    }

    return $cf.val();

};

const setCustomFieldValue = ($cf, {fieldtype, $source}, value) => {

    if (equalIgnoreCase(fieldtype, 'entity')) {

        const {fieldValue, dataValue} = value;

        $cf.val(fieldValue !== void 0 ? fieldValue : value);
        $source.data('value', dataValue !== void 0 ? dataValue : null);

    } else if ($cf.is(':checkbox')) {

        $cf.prop('checked', value || false);

    } else {

        $cf.val(value);

    }

};

const getCustomFieldData = ($cf, $cfWrap) => {

    let data = $cf.data();

    if (data.validate !== void 0) {

        return {$source: $cf, ...pick(data, 'fieldtype', 'value', 'validate')};

    }

    data = $cfWrap.data();

    if (data.validate !== void 0) {

        return {$source: $cfWrap, ...pick(data, 'fieldtype', 'value', 'validate')};

    }

    return {$source: null, fieldtype: null, value: null, validate: null};

};

const toggleCustomFieldValidation = (data, toggle) => {

    const {fieldtype, validate} = data;

    if (validate !== null) {

        // fieldtype can be null for url-value & url-description.
        const rules = equalIgnoreCase(fieldtype, 'entity') ? ['entityRequired'] : ['required'];

        validate.rules = toggle ? union(validate.rules, rules) : difference(validate.rules, rules);

    }

};

const getCustomFieldElHideClass = ($cfEl) => {

    // Custom checkbox is not the same as other cfs, so quick add validators show errors incorrectly after save.
    return $cfEl.is(customCheckboxSelector) ? 'hidden' : 'hide';

};

const hideCustomFieldEl = ($cfEl) => {

    const $cfWrap = $cfEl.closest('.tau-field.tau-custom.cf-process');
    const hideClass = getCustomFieldElHideClass($cfEl);

    $cfWrap.removeClass('show').addClass(hideClass);
    $cfWrap.find('input, select').toArray().forEach((el) => {

        const $cf = $(el);
        const data = getCustomFieldData($cf, $cfWrap);

        $cf.data('oldValue', getCustomFieldValue($cf, data));
        setCustomFieldValue($cf, data, '');

        toggleCustomFieldValidation(data, false);

    });

};

const showCustomFieldEl = ($cfEl) => {

    const $cfWrap = $cfEl.closest('.tau-field.tau-custom.cf-process');
    const isShown = $cfWrap.hasClass('show');
    const hideClass = getCustomFieldElHideClass($cfEl);

    $cfWrap.addClass('show').removeClass(hideClass);
    $cfWrap.find('input, select').toArray().forEach((el) => {

        const $cf = $(el);
        const data = getCustomFieldData($cf, $cfWrap);
        const oldValue = $cf.data('oldValue');

        if (!isShown && oldValue !== void 0) {

            setCustomFieldValue($cf, data, oldValue);

        }

        toggleCustomFieldValidation(data, true);

    });

};

const applyActualCustomFields = ($el, allCustomFields, actualCustomFields) => {

    const actualCustomFieldsMap = indexBy(actualCustomFields, 'id');
    const inactualCustomFields = filter(allCustomFields, (cf) => actualCustomFieldsMap[cf.id] === void 0);

    inactualCustomFields.forEach((v) => hideCustomFieldEl(findCustomFieldElByName($el, v.name,
        v.process ? v.process.id : null)));
    actualCustomFields.forEach((v) => showCustomFieldEl(findCustomFieldElByName($el, v.name,
        v.process ? v.process.id : null)));

};

const collectValues = ($el, customFields) =>
    object(customFields.map((v) => {

        const $cfEl = findCustomFieldElByName($el, v.name, v.process ? v.process.id : null);
        const value = getCustomFieldValue($cfEl);

        return [v.name, value];

    }));

const isSameEntityType = (v, entityType) => {

    const $v = $(v);

    return equalIgnoreCase($v.data('type-name'), entityType.name) &&
        equalIgnoreCase($v.data('type-title'), entityType.title);

};

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

    const process = getProcessByProcessAxis(axes);

    if (process) return process;

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

const listenQuickAddComponentBusForEntityType = (configurator, busName, config, axes, processes, entityType,
                                                 onFieldsReady) => {

    let allCustomFields = [];
    let activeCustomFields = [];
    const actualValues = {};

    onRender(configurator, busName, ($elCommon, componentBus) => {

        const $el = findFormByEntityType($elCommon, entityType);
        const adjust = () => componentBus.fire('adjustPosition');

        const handler = (actualProcess, values = {}) => {

            if (!actualProcess) return when(applyActualCustomFields($el, allCustomFields, [])).then(adjust);

            return when(getCustomFieldsForAxes(config, axes, [actualProcess], {entityType}, values,
                {skipValuesCheck: false}))
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

            const activeValues = collectValues($el, activeCustomFields);

            when(getActiveProcess($el, axes))
                .then((process) => {

                    if (process) {

                        actualValues[process.id] = activeValues;

                    }

                    handler(process, activeValues);

                });

        });

        onProcessChange($el, axes, (process) => handler(process, actualValues[process.id]));

    });

    when(getProcessByProjectAxis(axes))
    .then((process) => getCustomFieldsForAxes(config, axes, process ? [process] : processes, {entityType}, {},
        {skipValuesCheck: true}))
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
            when(processes, getCustomFieldsForAxes.preloadParentEntityStates(processes)))
        .then((processes) =>
            whenList(entityTypes.map((entityType) => {

                const def = new Deferred();

                const axes = getAxes(busName, initData, entityType);

                if (axes.length) {

                    listenQuickAddComponentBusForEntityType(configurator, busName, config, axes, processes, entityType,
                        def.resolve);

                }
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
