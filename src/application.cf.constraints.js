var $ = require("jQuery");
var _ = require("Underscore");
var ServiceContainer = require("tau/service.container");
var ServiceNavigator = require("tau/services/service.navigator");
var ServiceApplicationContext = require("tau/services/service.applicationContext");
var ApplicationGeneric = require("tau/components/component.application.generic");

var Component = require('./components/component.cf.constraints');

tau.mashups.addModule('tau/cf.constraints/components/component.cf.constraints', Component);

var ExtensionPlaceholder = require(
    "tau/ui/extensions/application.generic/ui.extension.application.generic.placeholder"
);

var ExtensionApplicationCfConstraints = require(
    "./components/extensions/application.generic/ui.extension.application.generic.cf.constraints"
);

var routes = [
    {
        pattern: /cfConstraints/,
        host: {
            name: 'master empty',
            type: 'master.empty'
        },
        type: {
            name: 'cf constraints',
            type: 'cf.constraints',
            namespace: 'tau/cf.constraints'
        }
    }
];

var getProcessCustomFields = function(entityConfig, applicationContext) {
    return _.map(entityConfig.customFields, function(customField) {
        return _.find(applicationContext.processes[0].customFields, function(cf) {
            return cf.entityKind.toLowerCase() == entityConfig.entity.entityType.name.toLowerCase()
                && cf.name == customField.name;
        });
    })
};

module.exports = function(config) {
    var configurator = new ServiceContainer();
    var contextService = new ServiceApplicationContext(configurator);
    contextService.getApplicationContext({ids: [config.entity.id]}, {success: function(context) {
        config.customFields = getProcessCustomFields(config, context);
        var placeholder = config.placeholder;
        var applicationId = 'cf.constraints';

        configurator._id = _.uniqueId('cf.constraints');
        configurator.registerService('navigator', new ServiceNavigator(configurator, { parameterName: applicationId }));
        configurator.registerService('cf.constraints.config', _.extend(config, {applicationContext: context}));
        configurator.getExternal().setFakeWindow();

        if (!configurator.getHashService().getHash()) {
            configurator.service('navigator').to('cfConstraints');
        }

        var applicationConfig = {
            name: 'cf constraints',
            options: {
                applicationId: applicationId,
                placeholder: placeholder,
                integration: {
                    showInPopup: true,
                    cssClass: 'cf-constraints-popup',
                    keepAlive: false
                }
            },
            routes: routes,
            context: {
                configurator: configurator
            },
            extensions: [
                ExtensionPlaceholder,
                ExtensionApplicationCfConstraints
            ]
        };

        var application = ApplicationGeneric.create(applicationConfig);
        application.initialize(applicationConfig);
    }});
};
