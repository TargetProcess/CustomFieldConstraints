import React, {findDOMNode} from 'react';
import cx from 'classnames';

export default class InputRichtext extends React.Component {

    render() {

        return (
            <textarea
                {...this.props}
                className={cx('tau-in-text', {'tau-error': this.props.isInvalid})}
                placeholder=" "
                ref="input"
            />
        );

    }

    get value() {

        return findDOMNode(this.refs.input).value;

    }

}
