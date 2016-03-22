import React from 'react';
import {shallow, mount} from 'enzyme';
import $ from 'jquery';

import Bubble from '../Bubble';

describe('Bubble', () => {

    it('renders nothing', () => {

        const overlay = (<em />);
        const dom = shallow(<Bubble overlay={overlay} target={{}} />);

        expect(dom).is.blank();

    });

    it('renders something on mount', () => {

        const cssSpy = sinon.spy();
        const tauBubbleSpy = sinon.stub().returns({
            css: cssSpy
        });

        $.fn.tauBubble = tauBubbleSpy;

        const overlay = (<em />);
        const target = (<div />);

        const dom = mount(<Bubble overlay={overlay} target={target} />);

        expect(dom).is.blank();
        expect(tauBubbleSpy)
            .to.be.calledOnce;

    });

});
