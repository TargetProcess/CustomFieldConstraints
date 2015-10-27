var ExtensionBase = require("tau/core/extension.base");

module.exports = ExtensionBase.extend({
    'bus afterInit': function(evtArgs, afterInitEvtArg) {
        this.fire('dataBind', {
            entity: afterInitEvtArg.config.context.entity
        });
    }
});