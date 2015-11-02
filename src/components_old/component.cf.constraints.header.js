var ComponentCreator = require("tau/components/component.creator");
var Model = require("./models/model.cf.constraints");
var Template = require("./templates/ui.template.cf.constraints.header");

module.exports = {
    create: function(config) {

        var creatorConfig = {
            extensions: [
                Model
            ],
            template: Template
        };

        return ComponentCreator.create(creatorConfig, config);
    }
};
