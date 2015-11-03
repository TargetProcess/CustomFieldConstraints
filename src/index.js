/* globals mashup, tau */
/* eslint global-require: 0 */
var {invoke} = require('Underscore');
var DataProvider = require('./lib/CFConstraints.data.provider');
var Requirements = require('./lib/CFConstraints.requirements');
var StateInterrupterStore = require('./lib/CFConstraints.state.interrupter.store');
var CFInterrupterStore = require('./lib/CFConstraints.cf.interrupter.store');
var StateInterrupterSlice = require('./lib/CFConstraints.state.interrupter.slice');
var CFInterrupterSlice = require('./lib/CFConstraints.cf.interrupter.slice');
var QuickAddAdapter = require('./lib/CFConstraints.quick.add');

var {placeholderId} = mashup.variables;
var mashupConfig = mashup.config;

var showPopupOld = ({entity, customFields}, next) => {

    const addTargetprocessModule = tau.mashups.addModule.bind(tau.mashups);

    require.ensure(['./components_old/application', './components_old/index.css'], () => {

        const Application = require('./components_old/application');

        require('./components_old/index.css');

        return new Application({
            placeholder: `#${placeholderId}`,
            customFields,
            entity,
            addTargetprocessModule,
            entityDeferred: next
        });

    }, 'ApplicationOld');

};

var showPopupNew = ({entity, processId, requirementsData}, next) => {

    require.ensure(['react', './screens/Form'], () => {

        const React = require('react');
        const Form = require('./screens/Form');

        const holder = document.getElementById(placeholderId).appendChild(document.createElement('div'));

        const handleCancel = () => {

            React.unmountComponentAtNode(holder);
            next.reject({
                response: {
                    Message: 'The changes were not saved as you didn\'t fill out the required custom fields'
                },
                status: 400
            });

        };

        const handleAfterSave = () => {

            React.unmountComponentAtNode(holder);
            next.resolve();

        };

        React.render((
            <Form
                entity={entity}
                mashupConfig={mashupConfig}
                onAfterSave={handleAfterSave}
                onCancel={handleCancel}
                processId={processId}
                requirementsData={requirementsData}
            />
        ), holder);

    }, 'FormContainer');

};

var showPopup = (...args) => {

    // const {entity} = args[0];

    // if (parseInt(entity.name, 10) % 2) showPopupOld(...args);
    // else showPopupNew(...args);

    showPopupNew(...args);
};

var init = () => {

    var dataProvider = new DataProvider();
    var requirements = new Requirements(mashupConfig);
    var subscribers = [
        new StateInterrupterStore(dataProvider, requirements, showPopup),
        new CFInterrupterStore(dataProvider, requirements, showPopup),
        new StateInterrupterSlice(dataProvider, requirements, showPopup),
        new CFInterrupterSlice(dataProvider, requirements, showPopup),
        new QuickAddAdapter(dataProvider, requirements)
    ];

    invoke(subscribers, 'subscribe');

};

init();
