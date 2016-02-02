import React from 'react';
import {shallow} from 'enzyme';

import TargetprocessLinkentity from '../TargetprocessLinkentity';

describe('TargetprocessLinkentity', () => {

    it('renders id, name and icon with system classes', () => {

        const dom = shallow(<TargetprocessLinkentity className="specific" entity={{id: 123, name: 'Bad Bug', entityType: {name: 'Bug'}}} />);

        expect(dom.equals(
            <span
                className="tau-linkentity TargetprocessLinkentity-block specific"
                entity={{id: 123, name: 'Bad Bug', entityType: {name: 'Bug'}}}
                short={false}
                title={null}
            >
                <em className="tau-entity-icon tau-entity-icon--bug tau-linkentity__icon">
                    {123}
                </em>
                <span className="tau-linkentity__inner">{'Bad Bug'}</span>
            </span>
        )).to.be.true;

    });

    it('renders id and icon with short format', () => {

        const dom = shallow(<TargetprocessLinkentity className="specific" entity={{id: 123, name: 'Bad Bug', entityType: {name: 'Bug'}}} short={true} />);

        expect(dom.equals(
            <span
                className="tau-linkentity TargetprocessLinkentity-block specific"
                entity={{id: 123, name: 'Bad Bug', entityType: {name: 'Bug'}}}
                short={true}
                title="Bad Bug"
            >
                <em className="tau-entity-icon tau-entity-icon--bug tau-linkentity__icon">
                    {123}
                </em>
                {null}
            </span>
        )).to.be.true;

    });

});
