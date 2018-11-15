import React from 'react';
import {shallow} from 'enzyme';

import Overlay from '../Overlay';

describe('Overlay', () => {

    it('renders with predefined classes', () => {

        const onClose = () => {};
        const dom = shallow(<Overlay onClose={onClose}><div /></Overlay>);

        expect(dom.equals(
            <div className="ui-popup-overlay Overlay-overlay">
                <div className="ui-popup Overlay-outerpopup">
                    <div className="Overlay-innerpopup">
                        <div className="close" onClick={onClose}></div>
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
