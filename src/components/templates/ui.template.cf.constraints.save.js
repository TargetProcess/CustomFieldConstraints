var templates = require("tau/core/templates-factory");

var config = {
    name: 'cf.constraints.save',
    engine: 'jqote2',
    markup: [
        '<div>',
        '<div class="i-role-error-message" style="display: none;">Please enter all custom fields</div>',
        '<div><button type="button" class="tau-btn tau-primary i-role-save">Save and Continue</button></div>',
        '</div>'
    ]
};

module.exports = templates.register(config);
