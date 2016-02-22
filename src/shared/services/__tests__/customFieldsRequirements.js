import {
    getCustomFieldsNamesForNewState,
    getCustomFieldsNamesForChangedCustomFields,
    getCustomFieldsNamesForChangedCustomFieldsWithDependent
} from '../customFieldsRequirements';

describe('customFieldsRequirements', () => {

    describe('getCustomFieldsNamesForNewState()', () => {

        it('returns list of required cfs by state and process', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx', 'yyy']
                        }],
                        customFields: []
                    },
                    feature: {}
                }
            }, {
                processId: 66,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['fff']
                        }],
                        customFields: []
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {};

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx', 'yyy']);

        });

        it('returns list of connected required cfs by state and process', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy', 'zzz']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {};

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx', 'yyy', 'zzz']);

        });

        it('returns list of connect required cfs excluding already existing fields', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx', 'yyy']
                        }],
                        customFields: [{
                            name: 'yyy',
                            requiredCustomFields: ['zzz', 'ddd']
                        }]

                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const currentValues = {};
            const initialValues = {
                xxx: 'lalala',
                ddd: 123123
            };

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', currentValues, initialValues))
                .to.be.eql(['yyy', 'zzz']);

        });

        it('returns list of connected required cfs in order', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx', 'aaa']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy', 'zzz']
                        }, {
                            name: 'aaa',
                            requiredCustomFields: ['bbb', 'ccc']
                        }, {
                            name: 'bbb',
                            requiredCustomFields: ['ddd']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {};

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx', 'yyy', 'zzz', 'aaa', 'bbb', 'ddd', 'ccc']);

        });

        it('solves simple circular dependencies', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['xxx']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {};

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx']);

        });

        it('solves circular dependencies without duplicates', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy']
                        }, {
                            name: 'yyy',
                            requiredCustomFields: ['xxx']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {};

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx', 'yyy']);

        });

        it('solves duplicates', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx', 'yyy']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {};

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx', 'yyy']);

        });

        it('connects fields with right values', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx', 'yyy']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['zzz'],
                            valueIn: ['foo']
                        }, {
                            name: 'yyy',
                            requiredCustomFields: ['www'],
                            valueNotIn: ['bar']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {
                xxx: 'foo',
                yyy: 'baz'
            };

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx', 'zzz', 'yyy', 'www']);

        });

        it('does not connect fields with wrong values', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx', 'yyy']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['zzz'],
                            valueIn: ['foo']
                        }, {
                            name: 'yyy',
                            requiredCustomFields: ['www'],
                            valueNotIn: ['bar']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {
                xxx: '',
                yyy: 'bar'
            };

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx', 'yyy']);

        });

        it('applies valueIn and valueNotIn as and', () => {

            let config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy'],
                            valueIn: ['foo'],
                            valueNotIn: ['bar']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {
                xxx: 'foo'
            };

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx', 'yyy']);

            config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy'],
                            valueIn: ['foo'],
                            valueNotIn: ['foo']
                        }]
                    },
                    feature: {}
                }
            }];

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['xxx']);

        });

        it('applies to special values', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['drop', 'multi', 'notdrop', 'notmulti', 'url', 'money']
                        }],
                        customFields: [{
                            name: 'drop',
                            requiredCustomFields: ['yyy'],
                            valueIn: ['foo', 'bar']
                        }, {
                            name: 'multi',
                            requiredCustomFields: ['www'],
                            valueIn: ['foo', 'bar']
                        }, {
                            name: 'notdrop',
                            requiredCustomFields: ['fff'],
                            valueNotIn: ['foo', 'bar']
                        }, {
                            name: 'notmulti',
                            requiredCustomFields: ['zzz'],
                            valueNotIn: ['foo', 'bar']
                        }, {
                            name: 'url',
                            requiredCustomFields: ['kkk'],
                            valueIn: ['foo', 'bar']
                        }, {
                            name: 'money',
                            requiredCustomFields: ['iii'],
                            valueIn: [42]
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const entityStateName = 'open';

            const cfValues = {
                drop: 'foo',
                multi: ['foo', 'baz'],
                notdrop: 'xxx',
                notmulti: ['foo', 'bar'],
                url: {
                    url: 'http://porn.com',
                    label: 'PORN'
                },
                money: '42'
            };

            expect(getCustomFieldsNamesForNewState(entityStateName, config, processId, 'userstory', cfValues))
                .to.be.eql(['drop', 'yyy', 'multi', 'www', 'notdrop', 'fff', 'notmulti', 'url', 'money', 'iii']);

        });

        it('applies entity state shortcuts', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: '_initial',
                            requiredCustomFields: ['initial']
                        }, {
                            name: '_final',
                            requiredCustomFields: ['final']
                        }, {
                            name: '_planned',
                            requiredCustomFields: ['planned']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const cfValues = {};

            expect(getCustomFieldsNamesForNewState({
                name: 'uno',
                isInitial: true
            }, config, processId, 'userstory', cfValues))
                .to.be.eql(['initial']);

            expect(getCustomFieldsNamesForNewState({
                name: 'duo',
                isFinal: true
            }, config, processId, 'userstory', cfValues))
                .to.be.eql(['final']);

            expect(getCustomFieldsNamesForNewState({
                name: 'tre',
                isPlanned: true
            }, config, processId, 'userstory', cfValues))
                .to.be.eql(['planned']);

        });

    });

    describe('getCustomFieldsNamesForChangedCustomFields()', () => {

        it('returns list of custom fields names required by config', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy', 'zzz']
                        }]
                    },
                    feature: {}
                }
            }, {
                processId: 66,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['fff']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['xxx'];

            const cfValues = {};

            expect(getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, config, processId, 'userstory', cfValues))
                .to.be.eql(['yyy', 'zzz']);

        });

        it('returns list of nested custom fields names', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy', 'zzz']
                        }, {
                            name: 'yyy',
                            requiredCustomFields: ['www']
                        }, {
                            name: 'zzz',
                            requiredCustomFields: ['vvv']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['xxx'];

            const cfValues = {};

            expect(getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, config, processId, 'userstory', cfValues))
                .to.be.eql(['yyy', 'www', 'zzz', 'vvv']);

        });

        it('returns list of custom fields names for values', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            valueIn: ['foo'],
                            requiredCustomFields: ['yyy', 'zzz']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['xxx'];

            const cfValues = {
                xxx: 'food'
            };

            expect(getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, config, processId, 'userstory', cfValues))
                .to.be.eql([]);

        });

        it('returns list of nested custom fields names for values', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy', 'zzz']
                        }, {
                            name: 'yyy',
                            valueIn: ['foo'],
                            requiredCustomFields: ['www']
                        }, {
                            name: 'zzz',
                            valueIn: ['bar'],
                            requiredCustomFields: ['vvv']
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['xxx'];

            const cfValues = {
                xxx: 'food',
                yyy: 'fook',
                zzz: 'bar'
            };

            expect(getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, config, processId, 'userstory', cfValues))
                .to.be.eql(['yyy', 'zzz', 'vvv']);

        });

        it('returns list of nested custom fields names for existing values', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            valueNotIn: [42],
                            requiredCustomFields: ['yyy']
                        }, {
                            name: 'yyy'
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['xxx'];

            const cfValues = {
                xxx: 442,
                yyy: void 0
            };

            const existingValues = {
                xxx: 1442
            };

            expect(getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, config, processId, 'userstory', cfValues, existingValues))
                .to.be.eql(['yyy']);

        });

        it('returns empty nested custom fields names for existing values if check value', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            valueNotIn: [42],
                            requiredCustomFields: ['yyy']
                        }, {
                            name: 'yyy'
                        }]
                    },
                    feature: {}
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['xxx'];

            const cfValues = {
                xxx: 42,
                yyy: void 0
            };

            const existingValues = {
                xxx: 1442
            };

            expect(getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, config, processId, 'userstory', cfValues, existingValues))
                .to.be.eql([]);

        });

        it('returns requirements when reset field', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy']
                        }]
                    }
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['xxx'];

            const cfValues = {
                xxx: null
            };

            const existingValues = {};

            expect(getCustomFieldsNamesForChangedCustomFields(changedFieldsNames, config, processId, 'userstory', cfValues, existingValues))
                .to.be.eql(['yyy']);

        });

    });

    describe('getCustomFieldsNamesForChangedCustomFieldsWithDependent()', () => {

        it('returns requirements when reset dependent field', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy']
                        }, {
                            name: 'yyy',
                            requiredCustomFields: ['zzz']
                        }]
                    }
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['yyy'];

            const cfValues = {};

            const existingValues = {
                xxx: 1442
            };

            const entityState = {
                name: 'Open'
            };

            expect(getCustomFieldsNamesForChangedCustomFieldsWithDependent(changedFieldsNames, entityState, config, processId, 'userstory', cfValues, existingValues))
                .to.be.eql(['yyy', 'zzz']);

        });

        it('returns direct requirements when not dependent field', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy']
                        }, {
                            name: 'yyy',
                            requiredCustomFields: ['zzz']
                        }]
                    }
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['yyy'];

            const cfValues = {
                yyy: 123
            };

            const existingValues = {
                xxx: 1442
            };

            const entityState = {
                name: 'Open'
            };

            expect(getCustomFieldsNamesForChangedCustomFieldsWithDependent(changedFieldsNames, entityState, config, processId, 'userstory', cfValues, existingValues))
                .to.be.eql(['zzz']);

        });

        it('returns requirements when reset dependent field by entity state', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['xxx']
                        }],
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy']
                        }, {
                            name: 'yyy',
                            requiredCustomFields: ['zzz']
                        }]
                    }
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['xxx'];

            const cfValues = {};

            const existingValues = {
            };

            const entityState = {
                name: 'Open'
            };

            expect(getCustomFieldsNamesForChangedCustomFieldsWithDependent(changedFieldsNames, entityState, config, processId, 'userstory', cfValues, existingValues))
                .to.be.eql(['xxx', 'yyy', 'zzz']);

        });

        it('not returns requirements if parent requirement is not set', () => {

            const config = [{
                processId: 13,
                constraints: {
                    userstory: {
                        customFields: [{
                            name: 'xxx',
                            requiredCustomFields: ['yyy']
                        }]
                    }
                }
            }];

            const processId = 13;
            const changedFieldsNames = ['yyy'];

            const cfValues = {};

            const existingValues = {};

            const entityState = {
                name: 'Open'
            };

            expect(getCustomFieldsNamesForChangedCustomFieldsWithDependent(changedFieldsNames, entityState, config, processId, 'userstory', cfValues, existingValues))
                .to.be.eql([]);

        });

    });

});
