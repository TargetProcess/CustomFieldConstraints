import React, {PropTypes as T} from 'react';
import {findDOMNode} from 'react-dom';
import cx from 'classnames';
import $ from 'jquery';
import {isArray, noop, union} from 'underscore';

import EmptyEditableModel from 'tau/core/extension.base';

import Bubble from 'components/Bubble';
import TargetprocessFinder from './TargetprocessFinder';
import GeneralIcon from '@targetprocess/general-icon';

import S from './InputEntityBase.css';

export default class InputEntityBase extends React.Component {

    static propTypes = {
        finderConfig: T.shape({
            entity: T.object,
            filterDsl: T.string,
            filterEntityTypeName: TargetprocessFinder.propTypes.filterEntityTypeName,
            filterFields: T.object.isRequired
        }),
        isInvalid: T.bool,
        multiple: T.bool,
        onBlur: T.func,
        onChange: T.func,
        placeholder: T.string,
        value: T.oneOfType([T.object, T.array])
    };

    static defaultProps = {
        multiple: false,
        finderConfig: {},
        onBlur: noop,
        onChange: noop,
        placeholder: 'Click to select',
        value: void 0
    };

    constructor(props) {

        super(props);

        this.state = {
            value: this.props.value || void 0,
            showFinder: false,
            showFinderBubble: false
        };

    }

    render() {

        const {children, id, isInvalid, finderConfig} = this.props;
        const {value, showFinder, showFinderBubble} = this.state;

        let finder;
        let finderBubble;

        if (showFinder) {

            finder = (
                <TargetprocessFinder
                    editableModel={EmptyEditableModel}
                    entity={finderConfig.entity}
                    filterDsl={finderConfig.filterDsl}
                    filterEntityTypeName={finderConfig.filterEntityTypeName}
                    filterFields={finderConfig.filterFields}
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

        const canReset = isArray(value) ? value.length !== 0 : Boolean(value);

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
                    {canReset ? (
                        <span className={S.reset}>
                            <GeneralIcon name="close-red" onClick={this.handleClickReset}/>
                        </span>
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
            value: multiple ? union(this.state.value || [], [entity]) : entity,
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
