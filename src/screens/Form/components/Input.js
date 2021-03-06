import React, {PropTypes as T} from 'react';
import {noop} from 'underscore';

import InputCheckbox from './InputCheckbox';
import InputDate from './InputDate';
import InputDropdown from './InputDropdown';
import InputEntity from './InputEntity';
import InputMultidropdown from './InputMultidropdown';
import InputNumber from './InputNumber';
import InputMoney from './InputMoney';
import InputRichtext from './InputRichtext';
import InputTemplatedUrl from './InputTemplatedUrl';
import InputText from './InputText';
import InputUrl from './InputUrl';
import InputMultipleEntities from './InputMultipleEntities';

export default class Input extends React.Component {

    static propTypes = {
        field: T.shape({
            type: T.string.isRequired
        }),
        isInvalid: T.bool,
        onChange: T.func,
        value: T.any
    };

    static defaultProps = {
        onChange: noop,
        specificProps: {},
        field: {
            type: 'text'
        }
    };

    render() {

        const {field} = this.props;
        const fieldType = field.type;

        const Widget = {
            checkbox: InputCheckbox,
            date: InputDate,
            dropdown: InputDropdown,
            entity: InputEntity,
            multipleselectionlist: InputMultidropdown,
            number: InputNumber,
            money: InputMoney,
            richtext: InputRichtext,
            templatedurl: InputTemplatedUrl,
            text: InputText,
            url: InputUrl,
            multipleentities: InputMultipleEntities
        }[fieldType] || InputText;

        return (
            <Widget
                {...this.props}
                onBlur={this.handleBlur}
                onChange={this.handleChange}
                ref="widget"
            />
        );

    }

    handleChange = () => {

        if (this.hasValue) {

            this.props.onChange(this.props.field, this.value);

        }

    };

    handleBlur = () => {

        if (this.hasValue) {

            this.props.onChange(this.props.field, this.value);

        }

    };

    get hasValue() {

        // Race in url component, onchange occurs before refs ready.
        return Boolean(this.refs.widget);

    }

    get value() {

        return this.refs.widget.value;

    }

}
