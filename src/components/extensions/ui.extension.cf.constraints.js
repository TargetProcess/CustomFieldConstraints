var _ = require("Underscore");
var ExtensionBase = require("tau/core/extension.base");
var Storage = require("tp3/mashups/storage");
var busRegistry = require("tau/core/bus.reg");

module.exports = ExtensionBase.extend({
    'bus afterInit + afterRender': function(evtArgs, afterInitEvtArg, afterRenderEvtArg) {
        var configService = afterInitEvtArg.config.context.configurator.service('cf.constraints.config');
        this._bindSave(configService, afterRenderEvtArg.element);
        this._bindRefreshOnFailure(configService, afterInitEvtArg.config.context.configurator);
    },
    _bindSave: function(configService, $containerElement) {

        var $save = $containerElement.find('.i-role-save');
        $save.click(_.bind(function(event) {

            event.preventDefault();
            new Storage()
                .getEntity()
                .ofType(configService.entity.entityType.name)
                .withId(configService.entity.id)
                .withFieldSetRestrictedTo(['customFields'])
                .withCallOnDone(_.bind(function($element, requiredCustomFields, entityDeferred, entity) {
                    var filledCfs = _.filter(requiredCustomFields, function(customField) {
                        var entityCustomField = _.find(entity.customFields, function(cf) {
                            return cf.name == customField.name;
                        });

                        return typeof entityCustomField != 'undefined' && entityCustomField.value != null && entityCustomField.value != '';
                    });

                    if (filledCfs.length == requiredCustomFields.length) {
                        entityDeferred.resolve();
                    }
                    else {
                        //add required styles to custom fields that has not been filled
                        $element.find('.ui-customfield__value:empty').addClass('ui-validationerror');
                    }
                }, this, $containerElement, configService.customFields, configService.entityDeferred))
                .execute();
        }, this));
    },
    _bindRefreshOnFailure: function(configService, configurator) {
        configurator.getStore().on({
            eventName: "failure",
            listener: this
        }, _.bind(function(requiredCustomFields) {
            _.each(requiredCustomFields, function(customField) {
                busRegistry.getByName('customField-' + customField.name).done(function(bus) {
                    bus.fire('refreshRow');
                });
            });
        }, this, configService.customFields));
    }
});
