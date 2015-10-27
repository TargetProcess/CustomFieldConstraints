var _ = require("Underscore");
var ViewBase = require("tau/core/view-base");
var ComponentContainer = require("tau/components/component.container");
var CustomFieldService = require("tau/services/service.customFields.cached");

var ConfigurationCFConstraints = require("./../configurations/configuration.cf.constraints");

module.exports = ViewBase.extend({
    init: function(config) {
        this._super(config);
    },

    initialize: function() {
        //LEFT BLANK SINCE WORKFLOW CHANGED
    },

    "bus beforeInit": function() {
        var configurator = this.config.context.configurator;
        configurator.getTitleManager().setTitle('CF Constraints');
        var configService = configurator.service('cf.constraints.config');
        var appConfig = this.config;

        this.setCustomFieldService(configurator, configService);

        var containerConfig = _.extend(appConfig, (new ConfigurationCFConstraints()).getConfig(configService));

        this.container = ComponentContainer.create({
            name: 'cf constraints page container',

            layout: containerConfig.layout,
            template: containerConfig.template,

            extensions: _.union([], containerConfig.extensions || []),
            context: _.extend(appConfig.context, {
                getCustomFields: function() {
                    return configService.customFields;
                },
                entity: configService.entity,
                applicationContext: configService.applicationContext
            })
        });

        this.container.on('afterInit', this['container afterInit'], this);
        this.container.on('afterRender', this['container afterRender'], this);
        this.container.on('componentsCreated', this['container componentsCreated'], this);

        this.container.initialize(containerConfig);
    },

    "container afterInit": function() {
        this.fireAfterInit();
    },

    "container componentsCreated": function(evtArgs) {
        this.fire(evtArgs.name, evtArgs.data);
    },

    "container afterRender": function(evtArgs) {
        this.fireBeforeRender();
        this.element = evtArgs.data.element;
        this.fireAfterRender();
    },

    setCustomFieldService: function(configurator, configService) {
        this._customFieldsService = new CustomFieldService({
            configurator: configurator,
            entity: configService.entity,
            customFields: configService.customFields
        });
        configurator.registerService('customFieldServiceV2', this._customFieldsService);
    },

    lifeCycleCleanUp: function() {
        this.destroyContainer();
        this._super();
    },

    destroyContainer: function() {
        if (!this.container) {
            return;
        }

        this.container.destroy();
        this.container = null;
    },

    destroy: function() {
        if (this._customFieldsService) {
            this._customFieldsService.destroy();
        }

        this.destroyContainer();
        this._super();
    }
});
