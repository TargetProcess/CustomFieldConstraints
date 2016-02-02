import React, {findDOMNode, PropTypes as T} from 'react';
import {wrap, noop} from 'underscore';

import ComponentContainerBusCreator from 'tau/components/component.container';

export default class TargetprocessComponent extends React.Component {

    static propTypes = {
        config: T.object,
        context: T.object,
        onEvents: T.func,
        type: T.string.isRequired
    };

    static defaultProps = {
        context: {},
        config: {},
        onEvents: noop
    };

    componentDidMount() {

        const {type, config, context, onEvents} = this.props;

        const bus = ComponentContainerBusCreator.create({
            name: `targetprocesscomponent.${type}`
        });

        this.bus = bus;

        bus.once('afterRender', ({data: {element: $el}}) => {

            if ($el.length) {

                findDOMNode(this).appendChild($el[0]);

            }

        });

        bus.once('childrenBuses.ready', ({data: buses}) => {

            const childBus = buses[0];

            childBus.fire = wrap(childBus.fire.bind(childBus), (next, event, data) => {

                onEvents(event, data);
                next(event, data);

            });

        });

        bus.initialize({
            context,
            children: [{
                ...config,
                type
            }]
        });

    }

    componentWillUnmount() {

        this.bus.fire('destroy');

    }

    render() {

        return (
            <div></div>
        );

    }

}
