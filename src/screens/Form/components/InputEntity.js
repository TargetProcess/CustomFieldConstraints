import React, {findDOMNode, PropTypes as T} from 'react';
import cx from 'classnames';
import $ from 'jquery';
import {noop} from 'underscore';

import Bubble from 'components/Bubble';

import TargetprocessFinder from './TargetprocessFinder';
import TargetprocessLinkentity from './TargetprocessLinkentity';

import S from './InputEntity.css';

export default class InputEntity extends React.Component {

    static propTypes = {
        filterEntityTypeName: T.string,
        filterFields: T.object,
        onBlur: T.func,
        onChange: T.func
    }

    static defaultProps = {
        filterFields: {},
        onBlur: noop,
        onChange: noop
    }

    state = {
        entity: void 0,
        showFinder: false,
        showFinderBubble: false
    }

    render() {

        const {filterEntityTypeName, filterFields} = this.props;
        const {entity, showFinder, showFinderBubble} = this.state;
        let finder;
        let finderBubble;

        if (showFinder) {

            finder = (
                <TargetprocessFinder
                    filterEntityTypeName={filterEntityTypeName}
                    filterFields={filterFields}
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
                    onClickOutside={this.handleClickOutsideFinder}
                    overlay={finder}
                    ref="bubble"
                    style={{
                        visibility: showFinderBubble ? 'visible' : 'hidden'
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
                <span className={S.placeholder}>
                    {'Click to select entity'}
                </span>
            );

        }

        return (
            <div
                {...this.props}
                className={S.block}
                id={null}
                onBlur={noop}
            >
                <div className={S.inputwrapper}>
                    <div

                        className={cx('tau-in-text', {
                            'tau-error': this.props.isInvalid
                        }, S.input)}
                        id={this.props.id}
                        onClick={this.handleFocus}
                        ref="trigger"
                        tabIndex="-1"
                    >
                        {innerOutput}
                    </div>
                    {entity ? (
                        <button className={S.reset} onClick={this.handleClickReset} type="button">
                            <i className="tau-icon-general tau-icon-close-round" />
                        </button>
                    ) : null}
                </div>
                {finderBubble}
            </div>
        );

    }

    handleFocus = () => {

        this.setState({
            ...this.state,
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

    handleClickOutsideFinder = (e) => {

        if (!$(e.target).closest('body').length) return;

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
