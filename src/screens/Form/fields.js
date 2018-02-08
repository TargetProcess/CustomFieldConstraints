import {identity, isNumber} from 'underscore';

import configurator from 'tau/configurator';

const culture = configurator.getSystemInfo().culture;
const defaultDecimalSeparator = '.';

const nullOrEmpty = (v) => v === null || v === '';

export const fields = {
    number: {
        mask: `^-?[0-9]*([${culture.decimalSeparator}][0-9]{0,2})?$`,
        format(number) {

            if (nullOrEmpty(number)) return number;

            return number.toString().replace(defaultDecimalSeparator, culture.decimalSeparator);

        },
        invariant(number) {

            if (nullOrEmpty(number)) return number;

            return number.replace(culture.decimalSeparator, defaultDecimalSeparator);

        },
        mayBeParse(number) {

            if (isNumber(number)) return number;

            const typedNumber = parseFloat(number);

            return !isNaN(typedNumber) ? typedNumber : number;

        }
    },
    money: {
        mask: `^-?[0-9]*([${culture.currencyDecimalSeparator}][0-9]{0,${culture.currencyDecimalDigits}})?$`,
        format(money) {

            if (nullOrEmpty(money)) return money;

            return money.toString().replace(defaultDecimalSeparator, culture.currencyDecimalSeparator);

        },
        invariant(money) {

            if (nullOrEmpty(money)) return money;

            return money.replace(culture.currencyDecimalSeparator, defaultDecimalSeparator);

        },
        mayBeParse(money) {

            if (isNumber(money)) return money;

            const typedMoney = parseFloat(money);

            return !isNaN(typedMoney) ? typedMoney : money;

        }
    }
};

export const getFieldValue = ({customField, value}) => {

    const thunk = fields[customField.type];
    const val = thunk ? thunk.mayBeParse : identity;

    return val(value);

};
