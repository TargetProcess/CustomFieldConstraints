/* globals mashup */
/* eslint global-require: 0 */

import modifyQuickAdd from './shared/services/interrupt/quickAdd';
import interruptSlice from './shared/services/interrupt/slice';
import interruptStore from './shared/services/interrupt/store';

import {CustomFieldsUpdateState} from 'utils';

const {placeholderId} = mashup.variables;
const mashupConfig = mashup.config;

const showPopupNew = ({entity, axes, replaceCustomFieldValueInChanges}, next) => {

    require.ensure(['react', 'react-dom', './screens/Form'], () => {

        const React = require('react');
        const ReactDOM = require('react-dom');
        const Form = require('./screens/Form').default;

        const holder = document.getElementById(placeholderId).appendChild(document.createElement('div'));

        const handleCancel = ({updateState = CustomFieldsUpdateState.Skipped}) => {

            ReactDOM.unmountComponentAtNode(holder);

            switch (updateState) {
                case CustomFieldsUpdateState.Skipped:
                    next.reject({
                        response: {
                            Message: 'Note, required custom fields weren\'t changed, so nothing was saved.'
                        },
                        status: 400
                    });
                    break;
                case CustomFieldsUpdateState.Partial:
                    next.reject({
                        response: {
                            Message: 'Note, only changed required custom fields were saved.'
                        },
                        status: 422
                    });
                    break;
                default:
                    throw new Error(`Unknown custom field update state ${updateState}. Please, contact support.`);
            }

        };

        const handleAfterSave = () => {

            ReactDOM.unmountComponentAtNode(holder);
            next.resolve();

        };

        ReactDOM.render((
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
