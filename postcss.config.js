/* eslint-disable global-require */
const _ = require('underscore');

module.exports = {
    plugins: [
        require('postcss-simple-vars')({
            variables() {

                const constants = require('@targetprocess/global-constants').default;
                // Prefix with `g` as it is global constant.
                const constantsPairs = _.pairs(constants).map(([key, value]) => [`g${key}`, value]);

                return _.object(constantsPairs);

            }
        })
    ]
};
