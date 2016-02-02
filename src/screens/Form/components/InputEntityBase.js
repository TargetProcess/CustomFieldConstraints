import React, {findDOMNode, PropTypes as T} from 'react';
import cx from 'classnames';
import $ from 'jquery';
import {noop} from 'underscore';

import Bubble from 'components/Bubble';

import TargetprocessFinder from './TargetprocessFinder';

import S from './InputEntityBase.css';

export default class InputEntityBase extends React.Component {

    static propTypes = {
        filterEntityTypeName: T.string,
        filterFields: T.object,
        multiple: T.bool,
        onBlur: T.func,
        onChange: T.func,
        placeholder: T.string
    };

    static defaultProps = {
        filterFields: {},
        multiple: false,
        onBlur: noop,
        onChange: noop,
        placeholder: 'Click to select'
    };

    state = {
        value: void 0,
        showFinder: false,
        showFinderBubble: false
    };

    render() {

        const {filterEntityTypeName, filterFields, children, id, isInvalid} = this.props;
        const {value, showFinder, showFinderBubble} = this.state;
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

        if (children) {

            innerOutput = children;

        } else {

            innerOutput = (
                <span className={S.placeholder}>
                    {this.props.placeholder}
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
                            'tau-error': isInvalid
                        }, S.input)}
                        id={id}
                        onClick={this.handleFocus}
                        ref="trigger"
                        tabIndex="-1"
                    >
                        {innerOutput}
                    </div>
                    {value ? (
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

    };

    handleSelect = (entity) => {

        const {multiple} = this.props;

        this.setState({
            value: multiple ? (this.state.value || []).concat(entity) : entity,
            showFinder: multiple,
            showFinderBubble: multiple
        }, () => this.props.onChange(entity));

    };

    handleClickReset = () => {

        this.setState({
            value: void 0,
            showFinder: false,
            showFinderBubble: false
        }, () => this.props.onChange(void 0));

    };

    handleClickOutsideFinder = (e) => {

        if (!$(e.target).closest('body').length) return;

        this.setState({
            ...this.state,
            showFinder: false,
            showFinderBubble: false
        }, () => this.props.onBlur());

    };

    handleFinderAdjusted = () => {

        if (this.refs.bubble) {

            this.refs.bubble.adjust();

        }

        setTimeout(() => {

            if (this.refs.bubble) {

                this.refs.bubble.adjust();

            }

            if (!this.state.showFinderBubble) {

                this.setState({
                    ...this.state,
                    showFinderBubble: true
                });

            }

        }, 300);

    };

    get value() {

        const value = this.state.value;

        return this.props.multiple ? (value || []) : value;

    }

}
