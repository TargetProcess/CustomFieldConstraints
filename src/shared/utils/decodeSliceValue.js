/* eslint no-bitwise:0, operator-assignment:0, padded-blocks: 0, one-var: 0, guard-for-in: 0, newline-after-var: 0 */

import utf8 from 'utf8';

const tryOrDefault = (func, defaultValue) => {
    try {
        return func();
    } catch (e) {
        return defaultValue;
    }
};

export default (value) => {
    if (!value) return value;

    if (isFinite(value)) {
        // Handles both numbers and strings encoded as numbers
        return parseInt(value, 10);
    }

    const match = value.match(/^b64_((?:\S|\s)*)_$/);

    if (!match) return value;

    const asBase64 = match[1].replace(/_0/g, '+').replace(/_1/g, '/').replace(/_2/g, '=');

    return tryOrDefault(() => utf8.decode(atob(asBase64)), value);

};
