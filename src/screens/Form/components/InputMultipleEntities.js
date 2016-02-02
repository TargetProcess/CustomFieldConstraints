import React, {PropTypes as T} from 'react';

import InputEntityBase from './InputEntityBase';

import TargetprocessLinkentity from './TargetprocessLinkentity';

export default class InputMultipleEntities extends React.Component {

    static propTypes = {
        value: T.array
    };

    static defaultProps = {
        value: []
    };

    render() {

        const {value} = this.props;

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

        return (
            <InputEntityBase
                {...this.props}
                multiple={true}
                placeholder="Click to select entities"
                ref="input"
            >
                {innerOutput}
            </InputEntityBase>
        );

    }

    get value() {

        return this.refs.input.value;

    }

}
