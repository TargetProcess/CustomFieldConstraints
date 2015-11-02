import React, {PropTypes as T} from 'react';

import TargetprocessComponent from 'components/TargetprocessComponent';
import noop from 'utils/noop';

export default class TargetprocessFinder extends React.Component {

    static propTypes = {
        filterDsl: T.string,
        filterEntityTypeName: T.oneOfType([
            T.string,
            T.arrayOf(T.string)
        ]),
        filterFields: T.object,
        onAdjust: T.func,
        onSelect: T.func
    }

    static defaultProps = {
        filterDsl: void 0,
        filterEntityTypeName: void 0,
        filterFields: void 0,
        onAdjust: noop,
        onSelect: noop
    }

    render() {

        const {filterEntityTypeName, filterDsl, filterFields} = this.props;

        const finderConfig = {};

        if (filterEntityTypeName) {

            finderConfig.entityType = filterEntityTypeName;

        }

        if (filterFields || filterDsl) {

            finderConfig.filter = {...filterFields};

            if (filterDsl) {

                finderConfig.filter.init_dsl = filterDsl;

            }

        }

        return (
            <TargetprocessComponent
                config={finderConfig}
                onEvents={this.handleEvents}
                type="finder.entity"
            />
        );

    }

    handleEvents = (eventName, data) => {

        const events = {
            entitySelected: ({entity}) => this.handleSelect(entity),
            adjustPosition: () => this.handleAdjust()
        };

        if (events[eventName]) events[eventName](data);

    }

    handleSelect = (entity) => this.props.onSelect(entity)

    handleAdjust = () => this.props.onAdjust()

}
