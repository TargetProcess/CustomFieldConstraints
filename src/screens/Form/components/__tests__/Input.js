import React from 'react';
import {shallow} from 'enzyme';

import Input from '../Input';
import InputText from '../InputText';
import InputDate from '../InputDate';

describe('Input', () => {

    it('renders text widget by default', () => {

        const dom = shallow(<Input some={true} />);

        expect(dom.equals(<InputText field={{type: 'text'}} onBlur={dom.instance().handleBlur} onChange={dom.instance().handleChange} some={true} specificProps={{}} />))
            .to.be.true;

    });

    it('renders widget by type', () => {

        const dom = shallow(<Input field={{type: 'date'}} some={true} />);

        expect(dom.equals(<InputDate field={{type: 'date'}} onBlur={dom.instance().handleBlur} onChange={dom.instance().handleChange} some={true} specificProps={{}} />))
            .to.be.true;

    });

});
