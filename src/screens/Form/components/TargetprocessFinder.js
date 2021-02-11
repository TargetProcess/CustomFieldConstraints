import React, {PropTypes as T} from 'react';
import {noop} from 'underscore';
import {isEnabled} from 'tp3/api/featureToggling/v1';
import tauTypes from 'tau/api/internal/store/types';

import TargetprocessComponent from 'components/TargetprocessComponent';

const getDefaultEntityTypeNamesToFilterBy = () => {

    // Same as in mode.finder.entity.data processOptions.
    const extendableGeneralNamesSorted = tauTypes.getAll()
        .filter((t) => t.isExtendableDomainType && t.isGeneral)
        .map((t) => t.name.toLowerCase())
        .sort();

    return [
        'project',
        'program',
        'release',
        ...(isEnabled('hideProjectIterations') ? [] : ['iteration']),
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
        'request',
        ...extendableGeneralNamesSorted
    ];

};

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
        filterEntityTypeName: getDefaultEntityTypeNamesToFilterBy(),
        filterFields: {},
        onAdjust: noop,
        onSelect: noop
    };

    render() {

        const {entity, filterEntityTypeName, filterDsl, filterFields} = this.props;

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
