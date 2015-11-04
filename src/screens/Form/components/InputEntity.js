import React, {findDOMNode, PropTypes as T} from 'react';
import cx from 'classnames';
import $ from 'jquery';
import {noop} from 'underscore';

import Bubble from 'components/Bubble';

import TargetprocessFinder from './TargetprocessFinder';
import TargetprocessLinkentity from './TargetprocessLinkentity';

import {block, placeholder, inputwrapper} from './InputEntity.css';

export default class InputEntity extends React.Component {

    static propTypes = {
        onChange: T.func
    }

    static defaultProps = {
        onChange: noop
    }

    state = {
        entity: void 0,
        showFinder: false,
        showFinderBubble: false
    }

    componentDidMount() {

        const inBubble = (el) => $(el).closest('.tau-bubble').length;

        this.clickListener = (e) => {

            if (this.state.showFinder && !inBubble(e.target)) {

                this.handleClickOutsideFinder();

            }

        };

        document.body.addEventListener('click', this.clickListener);

    }

    render() {

        const {entity, showFinder} = this.state;
        let finder;
        let finderBubble;

        if (showFinder) {

            finder = (
                <TargetprocessFinder
                    filterEntityTypeName="userstory"
                    filterFields={{
                        'project.id': 512
                    }}
                    onAdjust={this.handleFinderAdjusted}
                    onRendered={this.handleFinderRendered}
                    onSelect={this.handleSelect}
                />
            );

            finderBubble = (
                <Bubble
                    config={{
                        onPositionConfig: (c) => ({
                            ...c,
                            at: 'left middle',
                            my: 'right middle',
                            collision: 'flipfit flipfit'
                        })
                    }}
                    overlay={finder}
                    ref="bubble"
                    style={{
                        visibility: this.state.showFinderBubble ? 'visible' : 'hidden'
                    }}
                    target={findDOMNode(this.refs.trigger)}
                />
            );

        }

        let innerOutput;

        if (entity) {

            innerOutput = (
                <TargetprocessLinkentity entity={entity} />
            );

        } else {

            innerOutput = (
                <span className={placeholder}>
                    {'Click to select entity'}
                </span>
            );

        }

        return (
            <div
                {...this.props}
                className={block}
                onBlur={noop}
            >
                <div className={cx('tau-resetable-input', inputwrapper)}>
                    <div
                        className={cx('tau-in-text', {'tau-error': this.props.isInvalid})}
                        onClick={this.handleFocus}
                        ref="trigger"
                        tabIndex="0"
                    >
                        {innerOutput}
                    </div>
                    {entity ? <button type="button" onClick={this.handleClickReset} /> : null}
                </div>
                {finderBubble}
            </div>
        );

    }

    handleFocus = () => {

        this.setState({
            showFinder: !this.state.showFinder
        });

        if (this.state.showFinder) {

            this.props.onBlur();

        }

    }

    handleSelect = (entity) => {

        this.setState({
            entity,
            showFinder: false,
            showFinderBubble: false
        }, () => this.props.onChange(entity));

    }

    handleClickReset = () => {

        this.setState({
            entity: void 0,
            showFinder: false,
            showFinderBubble: false
        }, () => this.props.onChange(void 0));

    }

    handleClickOutsideFinder = () => {

        this.setState({
            ...this.state,
            showFinder: false,
            showFinderBubble: false
        }, () => this.props.onBlur());

    }

    handleFinderAdjusted = () => {

        if (this.refs.bubble) {

            this.refs.bubble.adjust();

        }

        if (!this.state.showFinderBubble) {

            this.setState({
                ...this.state,
                showFinderBubble: true
            });

        }

    }

    get value() {

        return this.state.entity;

    }

}
