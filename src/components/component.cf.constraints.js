var ComponentPageBase = require("tau/components/component.page.base");
var ExtensionCfConstraints = require("./extensions/ui.extension.cf.constraints");
var ViewType = require("./views/view.cf.constraints");

module.exports = {
    create: function(componentContext) {

        var componentConfig = {
            name: "cf constraints page component",
            extensions: [ExtensionCfConstraints],
            ViewType: ViewType
        };

        return ComponentPageBase.create(componentConfig, componentContext);
    }
};
