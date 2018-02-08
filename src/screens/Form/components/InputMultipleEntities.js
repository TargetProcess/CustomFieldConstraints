import React, {PropTypes as T} from 'react';

import InputEntityBase from './InputEntityBase';
import TargetprocessLinkentity from './TargetprocessLinkentity';
import TargetprocessFinder from './TargetprocessFinder';

export default class InputMultipleEntities extends React.Component {

    static propTypes = {
        entity: T.object,
        filterEntityTypeName: TargetprocessFinder.propTypes.filterEntityTypeName,
        filterFields: T.object,
        onBlur: T.func,
        onChange: T.func,
        value: T.array
    };

    static defaultProps = {
        value: []
    };

    render() {

        const {entity: sourceEntity, value, filterEntityTypeName, filterFields, onBlur, onChange} = this.props;

        let innerOutput;

        if (value.length) {

            innerOutput = value.map((entity) => (
                <TargetprocessLinkentity
                    entity={entity}
                    key={entity.id}
                    short={true}
                />
            ));

        }

        const filterDsl = value.length ? value.reduce((filter, v) => {

            return filter !== '' ? `${filter} and id != ${v.id}` : `id != ${v.id}`;

        }, '') : null;

        const finderConfig = {
            entity: sourceEntity,
            filterDsl,
            filterEntityTypeName,
            filterFields
        };

        return (
            <InputEntityBase
                finderConfig={finderConfig}
                multiple={true}
                onBlur={onBlur}
                onChange={onChange}
                placeholder="Click to select entities"
                ref="input"
                value={value}
            >
                {innerOutput}
            </InputEntityBase>
        );

    }

    get value() {

        return this.refs.input.value;

    }

}
