var templates = require("tau/core/templates-factory");

var config = {
    name: 'cf.constraints.header',
    engine: 'jqote2',
    markup: [
        '<div>',
        '<em class="ui-type-icon ui-type-icon-<%! this.entity.entityType.name.toLowerCase() %>"><%! this.entity.id %></em>',
        '<%! this.entity.name %>',
        '</div>'
    ]
};

module.exports = templates.register(config);
