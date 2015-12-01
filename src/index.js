/* globals mashup, tau */
/* eslint global-require: 0 */
import {invoke} from 'Underscore';

import DataProvider from './lib/CFConstraints.data.provider';
import Requirements from './lib/CFConstraints.requirements';
import StateInterrupterStore from './lib/CFConstraints.state.interrupter.store';
import CFInterrupterStore from './lib/CFConstraints.cf.interrupter.store';
import StateInterrupterSlice from './lib/CFConstraints.state.interrupter.slice';
import CFInterrupterSlice from './lib/CFConstraints.cf.interrupter.slice';
import QuickAddAdapter from './lib/CFConstraints.quick.add';

const {placeholderId} = mashup.variables;
const mashupConfig = mashup.config;

/* eslint-disable no-unused-vars */
const showPopupOld = ({entity, customFields}, next) => {

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
/* eslint-enable no-unused-vars */

const showPopupNew = ({entity, processId, requirementsData}, next) => {

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

const showPopup = (...args) => {

    // const {entity} = args[0];

    // if (parseInt(entity.name, 10) % 2) showPopupOld(...args);
    // else showPopupNew(...args);

    showPopupNew(...args);

};

const init = () => {

    const dataProvider = new DataProvider();
    const requirements = new Requirements(mashupConfig);
    const subscribers = [
        new StateInterrupterStore(dataProvider, requirements, showPopup),
        new CFInterrupterStore(dataProvider, requirements, showPopup),
        new StateInterrupterSlice(dataProvider, requirements, showPopup),
        new CFInterrupterSlice(dataProvider, requirements, showPopup),
        new QuickAddAdapter(dataProvider, requirements)
    ];

    invoke(subscribers, 'subscribe');

};

init();
