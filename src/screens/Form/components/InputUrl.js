import React, {findDOMNode} from 'react';
import cx from 'classnames';

import S from './InputUrl.css';

export default class InputUrl extends React.Component {

    static defaultProps = {
        value: {
            url: void 0,
            label: void 0
        }
    };

    render() {

        const {value} = this.props;

        return (
            <div className={S.block}>
                <div className={S.row}>
                    <label className={S.label}>
                        <span className={S.labeltext}>{'Url'}</span>
                        <input
                            {...this.props}
                            className={cx('tau-in-text', {'tau-error': this.props.isInvalid})}
                            ref="url"
                            type="text"
                            value={value.url}
                        />
                    </label>
                </div>

                <div className={S.row}>
                    <label className={S.label}>
                        <span className={S.labeltext}>{'Description'}</span>
                        <input
                            {...this.props}
                            className={cx('tau-in-text', {'tau-error': this.props.isInvalid})}
                            ref="label"
                            type="text"
                            value={value.label}
                        />
                    </label>
                </div>
            </div>
        );

    }

    get value() {

        return {
            url: findDOMNode(this.refs.url).value,
            label: findDOMNode(this.refs.label).value
        };

    }

}
