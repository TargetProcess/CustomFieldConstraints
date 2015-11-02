var templates = require("tau/core/templates-factory");

var config = {
    name: 'cf.constraints',
    engine: 'jqote2',
    markup: [
        '<div class="cf-constraints-container tau-page-entity main-container">',
        '<div class="cf-constraints-entity-name tau-entity-caption i-role-entity-name"></div>',
        '<div class="cf-constraints-note">Please specify the following custom fields</div>',
        '<div class="cf-constraints-customFields i-role-customFields"></div>',
        '<div class="cf-constraints-save i-role-save"></div>',
        '</div>'
    ]
};

module.exports = templates.register(config);
