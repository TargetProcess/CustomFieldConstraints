import React, {findDOMNode} from 'react';
import $ from 'jquery';

import InputTextarea from './InputTextarea';

import {block} from './TargetprocessMarkdownEditor.css';

export default class TargetprocessMarkdownEditor extends React.Component {

    state = {
        canApplyRicheditor: Boolean($.ui.richeditorMarkdown)
    }

    componentDidMount() {

        if (!this.state.canApplyRicheditor) return;

        const $editor = $(findDOMNode(this.refs.input.textarea));

        $editor.richeditorMarkdown({
            saveAction: {available: false},
            cancelAction: {available: false}
        });
        $editor.richeditorMarkdown('show');
        $editor.on('richeditormarkdownchange', this.props.onChange);
        $editor.richeditorMarkdown('instance').$editor.on('blur', 'textarea', this.props.onChange);

    }

    componentWillUnmount() {

        if (!this.state.canApplyRicheditor) return null;

        const $editor = $(findDOMNode(this.refs.input.textarea));

        $editor.richeditorMarkdown('destroy');

    }

    render() {

        return (
            <InputTextarea {...this.props} className={block} ref="input" />
        );

    }

    get value() {

        return this.state.canApplyRicheditor ?
            $(findDOMNode(this.refs.input.textarea)).richeditorMarkdown('getText') :
            this.refs.input.value;

    }

}
