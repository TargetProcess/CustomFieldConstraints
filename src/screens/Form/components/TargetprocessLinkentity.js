import React, {PropTypes as T} from 'react';
import cx from 'classnames';

import S from './TargetprocessLinkentity.css';

export default class TargetprocessLinkentity extends React.Component {

    static propTypes = {
        className: T.string,
        entity: T.shape({
            id: T.number.isRequired,
            name: T.string,
            entityType: T.shape({
                name: T.string.isRequired
            }).isRequired
        }).isRequired,
        short: T.bool
    };

    static defaultProps = {
        short: false
    };

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
