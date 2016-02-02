import React from 'react';
import cx from 'classnames';

import S from './Overlay.css';

export default class Overlay extends React.Component {

    render() {

        return (
            <div className={cx('ui-popup-overlay', S.overlay)} >
                <div className={cx('ui-popup', S.outerpopup)}>
                    <div className={cx(S.innerpopup)}>
                        <div className="close" onClick={this.props.onClose}></div>
                        <div className={cx(S.popupcontentcrollablearea)}>
                            <div className={cx(S.content)}>
                                {this.props.children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );

    }

}
