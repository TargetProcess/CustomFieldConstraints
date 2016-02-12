import React, {PropTypes as T} from 'react';
import {noop} from 'underscore';

import TargetprocessComponent from 'components/TargetprocessComponent';

export default class TargetprocessFinder extends React.Component {

    static propTypes = {
        filterDsl: T.string,
        filterEntityTypeName: T.oneOfType([
            T.string,
            T.arrayOf(T.string),
            T.object
        ]),
        filterFields: T.object,
        onAdjust: T.func,
        onSelect: T.func
    };

    static defaultProps = {
        filterDsl: void 0,
        filterEntityTypeName: [
            'project',
            'program',
            'release',
            'iteration',
            'teamiteration',
            'testcase',
            'testplan',
            'build',
            'impediment',

            'epic',
            'feature',
            'userstory',
            'task',
            'bug',
            'testplanrun',
            'request'
        ],
        filterFields: {},
        onAdjust: noop,
        onSelect: noop
    };

    render() {

        const {filterEntityTypeName, filterDsl, filterFields} = this.props;

        const finderConfig = {};

        finderConfig.entityType = null;

        finderConfig.filter = {
            entityType: filterEntityTypeName
        };

        finderConfig.filter = {...finderConfig.filter, ...filterFields};

        if (filterDsl) {

            finderConfig.filter.init_dsl = filterDsl; // eslint-disable-line camelcase

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
            'result.rendered': () => this.handleAdjust(),
            'content.$element.ready': () => this.handleAdjust()
        };

        if (events[eventName]) events[eventName](data);

    };

    handleSelect = (entity) => this.props.onSelect(entity);

    handleAdjust = () => this.props.onAdjust();

}
