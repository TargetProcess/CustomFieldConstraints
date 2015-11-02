import React, {PropTypes, findDOMNode} from 'react';
import $ from 'jquery';
import noop from 'utils/noop';

export default class Bubble extends React.Component {

    static propTypes = {
        config: PropTypes.object,
        onOuterClick: PropTypes.func.isRequired,
        overlay: PropTypes.node.isRequired,
        style: PropTypes.object,
        target: PropTypes.object.isRequired
    }

    static defaultProps = {
        config: {},
        onOuterClick: noop,
        style: {}
    }

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

        this.bubble = findDOMNode(React.render(overlay, this.span));
        // debugger;
        $(target)
            .tauBubble({
                target: target,
                content: this.span,
                showOnCreation: true,
                showEvent: 'none',
                hideEvent: 'none',
                documentMouseEvent: 'none',
                stackName: String(Number(new Date())),
                zIndex: 999,
                ...this.props.config
            });

        $(target).tauBubble('widget').css(this.props.style);

    }

    handleClickDocument = (e) => {

        const {target} = this.props;

        if (e.target !== React.findDOMNode(target) && !React.findDOMNode(target).contains(e.target)
            && e.target !== this.bubble && !this.bubble.contains(e.target)) {

            this.props.onOuterClick();

        }

    }

    adjust() {

        $(this.props.target).tauBubble('adjustPosition');

    }
}
