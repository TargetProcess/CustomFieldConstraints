/* eslint-disable */
// 4 tests
module.exports = {
    getApplicationPath: function() {
        return '/testpath';
    },
    getLoggedUser: function() {
        return {};
    },
    getStore: function() {

        return {
            getTypes: function() {
                return {
                    getDictionary: function() {
                        return {
                            userstory: {
                                resource: 'UserStories'
                            }
                        };
                    }
                };
            },
            typeMetaInfo: function() {
                return {
                    refs: {
                        workflows: false
                    }
                };
            }
        };
    },
    getAppStateStore: function() {
        return {};
    },

    getViewsMenuService: function() {

    },

    getRouting: function() {

        return {
            redirect: function() {}
        };
    },

    getUrlBuilder: function() {
        return {
            getDefaultViewUrl: function() {}
        };
    },

    getGlobalBus() {

        return {
            once() {},
            on() {}
        };
    }
};
