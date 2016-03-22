import React from 'react';
import {shallow} from 'enzyme';

import Overlay from '../Overlay';

describe('Overlay', () => {

    it('renders with predefined classes', () => {

        const dom = shallow(<Overlay><div /></Overlay>);

        expect(dom.equals(
            <div className="ui-popup-overlay Overlay-overlay">
                <div className="ui-popup Overlay-outerpopup">
                    <div className="Overlay-innerpopup">
                        <div className="close" onClick={dom.prop('onClise')}></div>
                        <div className="Overlay-popupcontentcrollablearea">
                            <div className="Overlay-content">
                                <div />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )).to.be.true;

    });

});
