import React, {PropTypes as T} from 'react';

import InputEntityBase from './InputEntityBase';

import TargetprocessLinkentity from './TargetprocessLinkentity';

export default class InputEntity extends React.Component {

    static propTypes = {
        value: T.object
    };

    static defaultProps = {
        value: void 0
    };

    render() {

        const {value} = this.props;

        let innerOutput;

        if (value) {

            innerOutput = (
                <TargetprocessLinkentity entity={value} />
            );

        }

        return (
            <InputEntityBase
                {...this.props}
                multiple={false}
                placeholder="Click to select entity"
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
