/* eslint-disable global-require */
const _ = require('underscore');

module.exports = {
    plugins: [
        require('postcss-simple-vars')({
            variables() {

                const constants = require('@targetprocess/global-constants').default;
                // Conversion like FontFamilty => g$FontFamily.
                const constantsPairs = _.pairs(constants).map(([key, value]) => [`g${key}`, value]);

                return _.object(constantsPairs);

            }
        })
    ]
};
