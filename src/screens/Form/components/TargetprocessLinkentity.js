import React from 'react';
import cx from 'classnames';

import {block} from './TargetprocessLinkentity.css';

export default class TargetprocessLinkentity extends React.Component {

    render() {

        const {entity, className} = this.props;

        return (
            <span {...this.props} className={cx('tau-linkentity', block, className)}>
                <em
                    className={cx('tau-entity-icon',
                        `tau-entity-icon--${entity.entityType.name.toLowerCase()}`,
                        'tau-linkentity__icon')}
                >
                    {entity.id}
                </em>
                <span className="tau-linkentity__inner">{entity.name}</span>
            </span>
        );

    }

}
