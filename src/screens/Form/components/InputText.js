import React, {findDOMNode} from 'react';
import cx from 'classnames';

export default class InputText extends React.Component {

    render() {

        return (
            <input
                placeholder=" "
                ref="input"
                type="text"
                {...this.props}
                className={cx('tau-in-text', {'tau-error': this.props.isInvalid})}
            />
        );

    }

    get value() {

        return findDOMNode(this.refs.input).value;

    }

}
