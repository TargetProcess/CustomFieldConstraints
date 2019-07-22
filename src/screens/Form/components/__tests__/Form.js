import React from 'react';

import {shallow} from 'enzyme';
import Form from '../Form';
import TargetprocessLinkentity from '../TargetprocessLinkentity';
import FormRow from '../FormRow';

const entity = {
    id: 777,
    name: 'hello',
    entityType: {
        name: 'userstory'
    }
};

describe('Form', () => {

    it('should output empty form and entity', () => {

        const dom = shallow((
            <Form
                entity={entity}
                validationMessage={'Note'}
            />
        ));

        expect(dom.find('TargetprocessLinkentity').equals(<TargetprocessLinkentity className="Form-header" entity={entity} short={false} />))
            .to.be.true;

        expect(dom.find('form'))
            .to.exist;

        expect(dom.find('form').find('FormRow'))
            .to.have.length(0);

        expect(dom.find('form').find('button'))
            .to.have.prop('disabled', null);

        expect(dom.find('form').find('button'))
            .to.have.prop('type', 'submit');

        expect(dom.find('form').find('button'))
            .to.have.text('Save and Continue');

    });

    it('should output form with rows', () => {

        const dom = shallow((
            <Form
                entity={entity}
                fields={[{name: 'foo'}, {name: 'bar'}]}
                validationMessage={'Note'}
            />
        ));

        expect(dom.find('FormRow'))
            .to.have.length(2);

        let row = dom.find('FormRow').at(0);

        expect(row.equals(<FormRow autoFocus={true} entity={entity} item={{name: 'foo'}} onChange={row.prop('onChange')} />))
            .to.be.true;

        row = dom.find('FormRow').at(1);

        expect(row.equals(<FormRow autoFocus={false} entity={entity} item={{name: 'bar'}} onChange={row.prop('onChange')} />))
            .to.be.true;

        expect(dom.find('form').find('button'))
            .to.have.prop('disabled', null);

    });

    it('should output global error', () => {

        const dom = shallow((
            <Form
                entity={entity}
                globalError={'You suck'}
                validationMessage={'Note'}
            />
        ));

        expect(dom.find('.Form-error'))
            .to.have.text('You suck');

        expect(dom.find('form').find('button'))
            .to.have.prop('disabled', null);

    });

    it('should disable button on input error', () => {

        const dom = shallow((
            <Form
                entity={entity}
                fields={[{name: 'foo', validationErrors: ['required']}]}
                validationMessage={'Note'}
            />
        ));

        expect(dom.find('form').find('button'))
            .to.have.prop('disabled', true);

    });

    it('should disable button on progress', () => {

        const dom = shallow((
            <Form
                entity={entity}
                showProgress={true}
                validationMessage={'Note'}
            />
        ));

        expect(dom.find('form').find('button'))
            .to.have.prop('disabled', true);

    });

    it('should output provided validation message', () => {

        const dom = shallow((
            <Form
                entity={entity}
                validationMessage={"Some note"}
            />
        ));

        expect(dom.find('div').at(1))
            .to.have.text('Some note');

    });

});
