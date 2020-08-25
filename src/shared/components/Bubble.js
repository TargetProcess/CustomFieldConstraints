import React, {PropTypes} from 'react';
import ReactDOM, {findDOMNode} from 'react-dom';
import $ from 'jquery';
import {noop} from 'underscore';

export default class Bubble extends React.Component {

    static propTypes = {
        config: PropTypes.object,
        onClickOutside: PropTypes.func.isRequired,
        overlay: PropTypes.node.isRequired,
        style: PropTypes.object,
        target: PropTypes.object.isRequired
    };

    static defaultProps = {
        config: {},
        onClickOutside: noop,
        style: {}
    };

    componentDidMount() {

        this.span = $('<span />').appendTo('body')[0];

        this.renderBubble(this.props.target, this.props.overlay);

        this.documentListener = ::this.handleClickDocument;
        document.body.addEventListener('click', this.documentListener);

    }

    componentWillReceiveProps(nextProps) {

        const {target: prevTarget} = this.props;
        const {target: nextTarget} = nextProps;

        if (prevTarget !== nextTarget) {

            if ($(prevTarget).tauBubble('instance')) {

                $(prevTarget).tauBubble('destroy');

            }

            this.renderBubble(nextTarget, nextProps.overlay);

        }

        if ($(prevTarget).tauBubble('instance')) {

            $(prevTarget).tauBubble('widget').css(nextProps.style);

        }

    }

    componentWillUnmount() {

        $(this.props.target).tauBubble('destroy');
        document.body.removeEventListener('click', this.documentListener);

    }

    render() {

        return null;

    }

    renderBubble(target, overlay) {

        this.bubble = findDOMNode(ReactDOM.render(overlay, this.span));

        $(target)
            .tauBubble({
                target: target,
                content: this.span,
                showOnCreation: true,
                showEvent: 'none',
                hideEvent: 'none',
                documentMouseEvent: 'none',
                stackName: String(Number(new Date())),
                zIndex: 100000, // Overlay.css specifies z-index of 99999, this needs to be higher
                ...this.props.config
            });

        $(target).tauBubble('widget').css(this.props.style);

    }

    handleClickDocument = (e) => {

        const {target} = this.props;

        if (e.target !== findDOMNode(target) && !findDOMNode(target).contains(e.target)
            && e.target !== this.bubble && !this.bubble.contains(e.target)) {

            this.props.onClickOutside(e);

        }

    };

    adjust() {

        $(this.props.target).tauBubble('adjustPosition');

    }
}
