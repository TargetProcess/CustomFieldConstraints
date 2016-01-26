/* globals mashup */
/* eslint global-require: 0 */

import modifyQuickAdd from './lib/quickAdd';
import interruptSlice from './lib/slice';
import interruptStore from './lib/store';

const {placeholderId} = mashup.variables;
const mashupConfig = mashup.config;

const showPopupNew = ({entity, axes}, next) => {

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
                changes={axes}
                entity={entity}
                mashupConfig={mashupConfig}
                onAfterSave={handleAfterSave}
                onCancel={handleCancel}
            />
        ), holder);

    }, 'FormContainer');

};

const showPopup = (...args) => {

    showPopupNew(...args);

};

const init = () => {

    interruptSlice(mashupConfig, showPopup);
    interruptStore(mashupConfig, showPopup);

    modifyQuickAdd(mashupConfig);

};

setTimeout(init, 100);
