import React from 'react';

import $ from 'jquery';
import {shallow} from 'enzyme';

import FormContainer from '../FormContainer';

describe('FormContainer', () => {

    let $ajax;

    beforeEach(() => {

        $ajax = sinon.stub($, 'ajax');

    });

    afterEach(() => {

        $ajax.restore();

    });

    it('outputs nothing and does no requests if no changes', () => {

        const entity = {
            id: 777,
            entityType: {
                name: 'userstory'
            }
        };

        const mashupConfig = [{
            processId: 13,
            constraints: {
                task: {
                    entityStates: [{
                        name: 'open',
                        requiredCustomFields: 'Text'
                    }]
                }
            }
        }];

        const dom = shallow((
            <FormContainer
                changes={[]}
                entity={entity}
                mashupConfig={mashupConfig}
                replaceCustomFieldValueInChanges={() => {}}
            />
        ));

        expect(dom)
            .to.be.empty;

        expect($ajax)
            .not.to.be.called;

    });

});
