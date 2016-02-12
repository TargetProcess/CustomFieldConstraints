import React from 'react';
import {shallow} from 'enzyme';

import FormRow from '../FormRow';
import Input from '../Input';

describe('FormRow', () => {

    it('outputs label and input for default text type', () => {

        const dom = shallow(<FormRow item={{name: 'foo'}} />);

        expect(dom)
            .to.have.prop('title', null);

        expect(dom.find('.FormRow-label').children('label'))
            .to.have.prop('htmlFor', 'foo')
            .and
            .to.have.text('foo');

        const input = dom.find('Input');

        expect(input.equals(
            <Input
                autoFocus={false}
                field={{type: 'text'}}
                id="foo"
                isInvalid={false}
                onChange={input.prop('onChange')}
                specificProps={{}}
                validationErrors={[]}
                value={void 0}

            />))
            .to.be.true;

    });

    it('outputs no label for checkbox', () => {

        const dom = shallow(<FormRow item={{name: 'foo', field: {type: 'checkbox'}}} />);

        expect(dom.find('.FormRow-label').children('label'))
            .to.have.text('');

    });

    it.skip('outputs label for money', () => {

        const dom = shallow(<FormRow item={{name: 'foo', field: {type: 'money', config: {units: '$$$'}}}} />);

        expect(dom.find('.FormRow-label').children('label').children('span').children('span').equals(
            <span>
                <span>{'foo ,'}</span>
                <span dangerouslySetInnerHTML={{__html: '$$$'}}></span>
            </span>))
            .to.be.true;

    });

    it('passes specific props for entity', () => {

        let dom = shallow(<FormRow item={{name: 'foo', field: {type: 'entity', config: {entityTypeIds: ['bug', 'task']}}}} />);
        let input = dom.find('Input');

        expect(input.prop('filterEntityTypeName'))
            .to.be.eql({
                $in: ['bug', 'task']
            });

        expect(input.prop('filterFields'))
            .to.be.eql({});

        dom = shallow(<FormRow item={{name: 'foo', field: {type: 'multipleentities', config: {entityTypeIds: ['bug', 'task']}}}} />);
        input = dom.find('Input');

        expect(input.prop('filterEntityTypeName'))
            .to.be.eql({
                $in: ['bug', 'task']
            });

        expect(input.prop('filterFields'))
            .to.be.eql({});

        dom = shallow(<FormRow entity={{project: {id: 777}}} item={{name: 'foo', field: {type: 'multipleentities', config: {entityTypeIds: ['bug', 'task']}}}} />);
        input = dom.find('Input');

        expect(input.prop('filterFields'))
            .to.be.eql({
                'project.id': 777
            });

    });

    it('outputs errors', () => {

        const dom = shallow(<FormRow item={{name: 'foo', hasErrors: true, hasDirtyValue: true, validationErrors: [{message: 'wrong'}, {message: 'bad'}]}} />);

        expect(dom.prop('title'))
            .to.be.eql('wrong\nbad');

        const input = dom.find('Input');

        expect(input)
            .to.have.prop('isInvalid', true);
        expect(input.prop('validationErrors'))
            .to.be.eql([{message: 'wrong'}, {message: 'bad'}]);

    });

});
