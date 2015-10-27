var _ = require("Underscore");
var DataProvider = require("./lib/CFConstraints.data.provider");
var Requirements = require("./lib/CFConstraints.requirements");
var StateInterrupterStore = require("./lib/CFConstraints.state.interrupter.store");
var CFInterrupterStore = require("./lib/CFConstraints.cf.interrupter.store");
var StateInterrupterSlice = require("./lib/CFConstraints.state.interrupter.slice");
var CFInterrupterSlice = require("./lib/CFConstraints.cf.interrupter.slice");
var QuickAddAdapter = require("./lib/CFConstraints.quick.add");

var ApplicationCFConstraints = require("./application.cf.constraints");

var mashupConfig = mashup.variables;
var config = mashup.config;

require('./index.css');

var showPopup = function({entity, customFields}, next) {

    return new ApplicationCFConstraints({
        placeholder: '#' + mashupConfig.placeholderId,
        customFields,
        entity,
        entityDeferred: next
    });

};

var init = () => {

    var dataProvider = new DataProvider();
    var requirements = new Requirements(config);
    var subscribers = [
        new StateInterrupterStore(dataProvider, requirements, showPopup),
        new CFInterrupterStore(dataProvider, requirements, showPopup),
        new StateInterrupterSlice(dataProvider, requirements, showPopup),
        new CFInterrupterSlice(dataProvider, requirements, showPopup),
        new QuickAddAdapter(dataProvider, requirements)
    ];

    _.invoke(subscribers, 'subscribe');

};

init();
