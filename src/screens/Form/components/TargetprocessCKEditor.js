import React from 'react';
import {findDOMNode} from 'react-dom';
import $ from 'jquery';
import {omit} from 'underscore';

import configurator from 'tau/configurator';

import InputTextarea from './InputTextarea';

import S from './TargetprocessCKEditor.css';

export default class TargetprocessCKEditor extends React.Component {

    state = {
        canApplyRicheditor: Boolean($.ui.richeditor)
    };

    componentDidMount() {

        if (!this.state.canApplyRicheditor) return null;

        const $editor = $(findDOMNode(this.refs.input.textarea));

        $editor.richeditor({
            ckPath: configurator.getCkPath(),
            ckFinderPath: configurator.getCkFinderPath(),
            settings: {
                toolbar: 'Basic',
                toolbarStartupExpanded: true,
                toolbarCanCollapse: false,
                startupFocus: this.props.autoFocus,
                uploaderConfig: {
                    uploadFiles: null
                },
                baseFloatZIndex: 100000
            },
            saveAction: {available: false},
            cancelAction: {available: false}
        });
        $editor.richeditor('show');
        $editor.on('richeditorchange', this.props.onChange);

        const setBlur = () => {

            if ($editor.richeditor('instance').editor) {

                $editor.richeditor('instance').editor.on('blur', this.props.onBlur);

            } else {

                setTimeout(setBlur, 100);

            }

        };

        setBlur();

    }

    componentWillUnmount() {

        if (!this.state.canApplyRicheditor) return null;

        const $editor = $(findDOMNode(this.refs.input.textarea));

        $editor.richeditor('destroy');

    }

    render() {

        return (
            <InputTextarea {...omit(this.props, 'onBlur', 'onChange')} className={S.block} ref="input" />
        );

    }

    get value() {

        return this.state.canApplyRicheditor ?
            $(findDOMNode(this.refs.input.textarea)).richeditor('getText') :
            this.refs.input.value;

    }

}
