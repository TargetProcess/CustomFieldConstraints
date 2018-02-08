/* eslint-disable */
// 4 tests
module.exports = {
    getApplicationPath: function() {
        return '/testpath';
    },
    getStore: function() {

        return {
            getTypes: function() {
                return {
                    getDictionary: function() {
                        return {
                            bug: {
                                resource: 'Bugs'
                            },
                            userstory: {
                                resource: 'UserStories'
                            }
                        };
                    }
                };
            }
        };
    },
    getAppStateStore: function() {
        return {};
    },

    getSystemInfo() {
        return {
            culture: {
                decimalSeparator: '.',
                currencyDecimalSeparator: '.',
                currencyDecimalDigits: '2'
            }
        };
    }
};
