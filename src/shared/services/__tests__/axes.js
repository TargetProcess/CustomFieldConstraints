import {getCustomFieldsForAxes} from '../axes';
import $, {when} from 'jquery';

$.whenList = (arr) => $.when(...arr);

describe('axes', () => {

    let $ajax;

    const entity = {
        id: 123,
        entityType: {
            name: 'bug'
        }
    };

    beforeEach(() => {

        $ajax = sinon.stub($, 'ajax');

    });

    afterEach(() => {

        $ajax.restore();
        getCustomFieldsForAxes.resetCache();

    });

    describe('getCustomFieldsForAxes()', () => {

        it('returns nothing if no axes', () => {

            const axes = [];

            const config = [];

            return getCustomFieldsForAxes(config, axes, [{id: 777}], entity).then((res) => {

                expect($ajax).not.to.be.called;

                expect(res)
                    .to.be.eql([]);

            });

        });

        describe('states', () => {

            const processes = [{id: 777}];

            const config = [{
                processId: 777,
                constraints: {
                    bug: {
                        entityStates: [
                            {
                                name: 'Open',
                                requiredCustomFields: ['Cf1']
                            }
                        ]
                    }
                }
            }];

            it('returns custom fields for entity state id', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: {
                        id: 42
                    }
                }];

                $ajax.onCall(0).returns(when({
                    Items: [{
                        id: 42,
                        name: 'Open',
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }, {
                        id: 43,
                        name: 'Open',
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields of parent entity state for entity state id', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: {
                        id: 42
                    }
                }];

                $ajax.onCall(0).returns(when({
                    Items: [{
                        id: 42,
                        name: 'Opened (Open)',
                        entityType: {
                            name: 'Bug'
                        },
                        parentEntityState: {
                            id: 10,
                            name: 'Open',
                            entityType: {
                                name: 'Bug'
                            },
                            workflow: {
                                process: {
                                    id: 777
                                }
                            }
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }, {
                        id: 43,
                        name: 'Ready',
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields for entity state name', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: 'open'
                }];

                $ajax.onCall(0).returns(when({
                    Items: [{
                        name: 'Open',
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }, {
                        name: 'Open',
                        entityType: {
                            name: 'UserStory'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields of parent entity state for entity state name', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: 'open'
                }];

                $ajax.onCall(0).returns(when({
                    Items: [{
                        name: 'Opened (Open)',
                        entityType: {
                            name: 'Bug'
                        },
                        parentEntityState: {
                            name: 'Open',
                            entityType: {
                                name: 'Bug'
                            },
                            workflow: {
                                process: {
                                    id: 777
                                }
                            }
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }, {
                        name: 'Open',
                        entityType: {
                            name: 'UserStory'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields by entity state shortcut', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: '_final'
                }];

                $ajax.onCall(0).returns(when({
                    Items: [{
                        name: 'Open',
                        isFinal: true,
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields of parent entity name for entity state shortcut', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: '_final'
                }];

                $ajax.onCall(0).returns(when({
                    Items: [{
                        name: 'Ready to do (Open)',
                        isFinal: false,
                        parentEntityState: {
                            name: 'Open',
                            isFinal: true,
                            entityType: {
                                name: 'Bug'
                            },
                            workflow: {
                                process: {
                                    id: 777
                                }
                            }
                        },
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns none if entity state is not found', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: '_final'
                }];

                $ajax.onCall(0).returns(when({
                    Items: [{
                        name: 'Open',
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => {

                        expect(res).to.be.eql([]);
                        expect($ajax).to.be.calledOnce;

                    });

            });

            it('returns none if entity state is found but parent entity state is not', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: '_final'
                }];

                $ajax.onCall(0).returns(when({
                    Items: [{
                        name: 'Rejected (In Progress)',
                        entityType: {
                            name: 'Bug'
                        },
                        isFinal: true,
                        parentEnityState: {
                            name: 'In Progress',
                            entityType: {
                                name: 'Bug'
                            },
                            isFinal: false,
                            workflow: {
                                process: {
                                    id: 777
                                }
                            }
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => {

                        expect(res).to.be.eql([]);
                        expect($ajax).to.be.calledOnce;

                    });

            });

        });

        describe('custom fields', () => {

            const processes = [{id: 777}];

            const config = [{
                processId: 777,
                constraints: {
                    bug: {
                        customFields: [
                            {
                                name: 'Cf1',
                                requiredCustomFields: ['Cf2']
                            }
                        ]
                    }
                }
            }];

            it('returns custom fields for custom field name', () => {

                const axes = [{
                    type: 'customfield',
                    customFieldName: 'cf1',
                    targetValue: '42'
                }];

                $ajax.onCall(0).returns(when({
                    items: [{
                        name: 'Cf1',
                        entityType: {
                            name: 'Bug'
                        }
                    }, {
                        name: 'Cf2',
                        entityType: {
                            name: 'Bug'
                        }
                    }]
                }));

                return getCustomFieldsForAxes(config, axes, processes, entity).then((res) => expect(res)
                    .to.be.eql([{
                        name: 'Cf2',
                        entityType: {
                            name: 'Bug'
                        }
                    }]));

            });

            it('skips calculated custom fields', () => {

                const axes = [{
                    type: 'customfield',
                    customFieldName: 'cf1',
                    targetValue: '42'
                }];

                $ajax.onCall(0).returns(when({
                    items: [{
                        name: 'Cf1',
                        entityType: {
                            name: 'Bug'
                        }
                    }, {
                        name: 'Cf2',
                        entityType: {
                            name: 'Bug'
                        },
                        config: {
                            calculationModel: 42
                        }
                    }]
                }));

                return getCustomFieldsForAxes(config, axes, processes, entity).then((res) => expect(res)
                    .to.be.eql([]));

            });

        });

        describe('merges axes custom fields', () => {

            const processes = [{id: 777}];

            const config = [{
                processId: 777,
                constraints: {
                    bug: {
                        entityStates: [{
                            name: 'Open',
                            requiredCustomFields: ['Cf0', 'Cf1', 'Cf3']
                        }],
                        customFields: [
                            {
                                name: 'Cf1',
                                requiredCustomFields: ['Cf2']
                            }
                        ]
                    }
                }
            }];

            it('remove custom fields if already in axis', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: {
                        id: 43
                    }
                }, {
                    type: 'customfield',
                    customFieldName: 'cf1',
                    targetValue: '42'
                }];

                $ajax.onCall(0).returns(when({
                    Items: [{
                        id: 43,
                        name: 'Open',
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }, {
                        name: 'Cf2',
                        id: 2
                    }, {
                        name: 'Cf3',
                        id: 3
                    }, {
                        name: 'Cf0',
                        id: 0
                    }]
                }));

                return getCustomFieldsForAxes.preloadEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf0',
                            id: 0
                        }, {
                            name: 'Cf2',
                            id: 2
                        }, {
                            name: 'Cf3',
                            id: 3
                        }]));

            });

        });

    });

});
