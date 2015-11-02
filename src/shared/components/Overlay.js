import React from 'react';
import cx from 'classnames';

import styles from './Overlay.css';

export default class Overlay extends React.Component {

    render() {

        return (
            <div className={cx('ui-popup-overlay', styles.overlay)} >
                <div className={cx('ui-popup', styles.outerpopup)}>
                    <div className={cx(styles.innerpopup)}>
                        <div className="close" onClick={this.props.onClose}></div>
                        <div className={cx(styles.popupcontentcrollablearea)}>
                            <div className={cx(styles.content)}>
                                {this.props.children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );

    }

}
