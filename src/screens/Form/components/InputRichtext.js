import React, {PropTypes as T} from 'react';

import TargetprocessCKEditor from './TargetprocessCKEditor';
import TargetprocessMarkdownEditor from './TargetprocessMarkdownEditor';

export default class InputRichtext extends React.Component {

    static propTypes = {
        format: T.oneOf(['html', 'markdown'])
    }

    static defaultProps = {
        format: 'html'
    }

    render() {

        const {format} = this.props;

        if (format === 'markdown') {

            return (<TargetprocessMarkdownEditor {...this.props} ref="input" />);

        } else {

            return (<TargetprocessCKEditor {...this.props} ref="input" />);

        }

    }

    get value() {

        return this.refs.input.value;

    }

}
