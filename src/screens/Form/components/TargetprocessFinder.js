import React, {PropTypes as T} from 'react';
import {noop} from 'underscore';

import TargetprocessComponent from 'components/TargetprocessComponent';

export default class TargetprocessFinder extends React.Component {

    static propTypes = {
        editableModel: T.func,
        entity: T.shape({
            id: T.number.isRequired,
            entityType: T.shape({
                name: T.string.isRequired
            }).isRequired,
            options: T.array
        }),
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

            'portfolioepic',
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

        const {entity, customField, filterEntityTypeName, filterDsl, filterFields} = this.props;

        const config = {
            entityType: null,
            filter: {
                entityType: filterEntityTypeName,
                ...filterFields
            },
            editableModel: this.props.editableModel
        };

        if (filterDsl) {

            config.filter.init_dsl = filterDsl; // eslint-disable-line camelcase

        }

        if (customField) {

            config.customField = customField;

        }

        const context = entity ? {entity} : null;

        return (
            <TargetprocessComponent
                config={config}
                context={context}
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
