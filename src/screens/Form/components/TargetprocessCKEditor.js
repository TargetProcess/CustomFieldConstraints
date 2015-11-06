import React, {findDOMNode} from 'react';
import $ from 'jquery';

import configurator from 'tau/configurator';

import InputTextarea from './InputTextarea';

import {block} from './TargetprocessCKEditor.css';

export default class TargetprocessCKEditor extends React.Component {

    state = {
        canApplyRicheditor: Boolean($.ui.richeditorMarkdown)
    }

    componentDidMount() {

        if (!this.state.canApplyRicheditor) return null;

        const $editor = $(findDOMNode(this.refs.input.textarea));

        $editor.richeditor({
            ckPath: configurator.getCkPath(),
            settings: {
                toolbar: 'Basic',
                toolbarStartupExpanded: true,
                toolbarCanCollapse: false,
                startupFocus: true,
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

                $editor.richeditor('instance').editor.on('blur', this.props.onChange);

            } else {

                setTimeout(setBlur, 100);

            }

        };

        setBlur();

    }

    render() {

        return (
            <InputTextarea {...this.props} className={block} ref="input" />
        );

    }

    get value() {

        return this.state.canApplyRicheditor ?
            $(findDOMNode(this.refs.input.textarea)).richeditor('getText') :
            this.refs.input.value;

    }

}
