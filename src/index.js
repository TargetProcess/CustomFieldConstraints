/* globals mashup */
/* eslint global-require: 0 */
import {invoke} from 'Underscore';

// import DataProvider from './lib/DataProvider';
// import Requirements from './lib/Requirements';

import stateSliceInterrupt from './lib/stateSlice';
import stateStoreInterrupt from './lib/stateStore';
import customFieldStoreInterrupt from './lib/customFieldStore';
import customFieldSliceInterrupt from './lib/customFieldSlice';

// import StateInterrupterStore from './lib/entity/state/StoreInterrupter';
// import CFInterrupterStore from './lib/entity/customFields/StoreInterrupter';
// import StateInterrupterSlice from './lib/entity/state/SliceInterrupter';
// import CFInterrupterSlice from './lib/entity/customFields/SliceInterrupter';

// import QuickAddAdapter from './lib/quickAdd';

import modifyQuickAdd from './lib/quickAdd';

const {placeholderId} = mashup.variables;
const mashupConfig = mashup.config;

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

    showPopupNew(...args);

};

const init = () => {

    stateSliceInterrupt(mashupConfig, showPopup);
    stateStoreInterrupt(mashupConfig, showPopup);
    customFieldStoreInterrupt(mashupConfig, showPopup);
    customFieldSliceInterrupt(mashupConfig, showPopup);

    modifyQuickAdd(mashupConfig);

    // const dataProvider = new DataProvider();
    // const requirements = new Requirements(mashupConfig);
    const subscribers = [
        // new StateInterrupterStore(dataProvider, requirements, showPopup),
        // new CFInterrupterStore(dataProvider, requirements, showPopup),
        // new StateInterrupterSlice(dataProvider, requirements, showPopup)
        //,
        // new CFInterrupterSlice(dataProvider, requirements, showPopup),
        // new QuickAddAdapter(dataProvider, requirements)
    ];

    invoke(subscribers, 'subscribe');

};

setTimeout(init, 100);


