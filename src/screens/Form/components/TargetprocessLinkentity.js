import React from 'react';
import cx from 'classnames';

import S from './TargetprocessLinkentity.css';

export default class TargetprocessLinkentity extends React.Component {

    render() {

        const {className, entity, short} = this.props;

        return (
            <span
                {...this.props}
                className={cx('tau-linkentity', S.block, className)}
                title={short ? entity.name : null}
            >
                <em
                    className={cx('tau-entity-icon',
                        `tau-entity-icon--${entity.entityType.name.toLowerCase()}`,
                        'tau-linkentity__icon')}
                >
                    {entity.id}
                </em>
                {short ? null : (
                    <span className="tau-linkentity__inner">{entity.name}</span>
                )}

            </span>
        );

    }

}
