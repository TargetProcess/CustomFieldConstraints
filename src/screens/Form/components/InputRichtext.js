import React from 'react';

import TargetprocessCKEditor from './TargetprocessCKEditor';

export default class InputRichtext extends React.Component {

    render() {

        return <TargetprocessCKEditor {...this.props} ref="input" />;

    }

    get value() {

        return this.refs.input.value;

    }

}
