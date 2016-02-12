/* globals mashup */
/* eslint global-require: 0 */

import modifyQuickAdd from './shared/services/interrupt/quickAdd';
import interruptSlice from './shared/services/interrupt/slice';
import interruptStore from './shared/services/interrupt/store';

const {placeholderId} = mashup.variables;
const mashupConfig = mashup.config;

const showPopupNew = ({entity, axes, replaceCustomFieldValueInChanges}, next) => {

    require.ensure(['react', './screens/Form'], () => {

        const React = require('react');
        const Form = require('./screens/Form').default;

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
                replaceCustomFieldValueInChanges={replaceCustomFieldValueInChanges}
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
