import $ from 'jquery';
import React, {PropTypes as T} from 'react';
import cx from 'classnames';

import S from './Overlay.css';

import {CustomFieldsUpdateState} from 'utils';

const ESC_KEY_CODE = 27;

export default class Overlay extends React.Component {

    static propTypes = {
        children: T.object.isRequired,
        onClose: T.func.isRequired
    };

    componentDidMount() {

        $(window).on('keydown', (evt) => {

            if (evt.keyCode === ESC_KEY_CODE) this.props.onClose({updateState: CustomFieldsUpdateState.Skipped});

        });

    }

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
