import React, {PropTypes as T} from 'react';

import InputEntityBase from './InputEntityBase';
import TargetprocessLinkentity from './TargetprocessLinkentity';
import TargetprocessFinder from './TargetprocessFinder';

export default class InputEntity extends React.Component {

    static propTypes = {
        entity: T.object,
        filterEntityTypeName: TargetprocessFinder.propTypes.filterEntityTypeName,
        filterFields: T.object,
        onBlur: T.func,
        onChange: T.func,
        value: T.object
    };

    static defaultProps = {
        value: void 0
    };

    render() {

        const {entity, value, filterEntityTypeName, filterFields, onBlur, onChange} = this.props;

        let innerOutput;

        if (value) {

            innerOutput = (
                <TargetprocessLinkentity entity={value} />
            );

        }

        const finderConfig = {
            entity,
            filterDsl: value ? `id != ${value.id}` : null,
            filterEntityTypeName,
            filterFields
        };

        return (
            <InputEntityBase
                finderConfig={finderConfig}
                multiple={false}
                onBlur={onBlur}
                onChange={onChange}
                placeholder="Click to select entity"
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
