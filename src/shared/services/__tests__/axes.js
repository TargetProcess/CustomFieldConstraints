import {getCustomFieldsForAxes} from '../axes';
import $, {when} from 'jquery';

$.whenList = (arr) => $.when(...arr);

const createSandbox = () => {

    return {
        obj: null,
        propName: null,
        propValue: null,
        hasOwnProp: false,

        stub(obj, prop) {

            if (obj !== null && obj !== void 0) {

                this.obj = obj;
                this.propName = prop;
                this.propValue = obj[prop];
                this.hasOwnProp = Object.getOwnPropertyNames(obj).includes(prop);

                const me = this; // eslint-disable-line consistent-this

                return {

                    value(v) {

                        me.obj[prop] = v;

                    }

                };

            }

            throw new Error('object is null or undefined');

        },

        restore() {

            if (this.hasOwnProp) {

                this.obj[this.propName] = this.propValue;

            } else {

                delete this.obj[this.propName];

            }

        }

    };

};

describe('axes', () => {

    let $ajax;
    let windowSandbox;

    const entity = {
        id: 123,
        entityType: {
            name: 'Bug'
        }
    };

    beforeEach(() => {

        $ajax = sinon.stub($, 'ajax');

        windowSandbox = createSandbox();
        windowSandbox.stub(window, 'tauFeatures').value({
            systemCustomFields: false,
            hideProjectIterations: false
        });

    });

    afterEach(() => {

        $ajax.restore();
        getCustomFieldsForAxes.resetCache();
        windowSandbox.restore();

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

            it('returns custom fields by entity state id when entity state has no parent', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: {
                        id: 42
                    }
                }];

                $ajax.onCall(0).returns(when({
                    items: [{
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
                    items: []
                }));

                $ajax.onCall(2).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields by entity state id when entity state has parent', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: {
                        id: 95
                    }
                }];

                $ajax.onCall(0).returns(when({
                    items: [{
                        id: 42,
                        name: 'Working On',
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
                    items: [{id: 43}]
                }));

                $ajax.onCall(2).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields by entity state name when entity state has no parent', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: 'open'
                }];

                $ajax.onCall(0).returns(when({
                    items: [{
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
                    items: []
                }));

                $ajax.onCall(2).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields by entity state name when entity state has parent', () => {

                const axes = [{
                    type: 'entitystate',
                    targetValue: 'created'
                }];

                $ajax.onCall(0).returns(when({
                    items: [{
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
                    items: [{name: 'open'}]
                }));

                $ajax.onCall(2).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
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
                    targetValue: '_initial'
                }];

                $ajax.onCall(0).returns(when({
                    items: [{
                        name: 'Open',
                        isInitial: true,
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

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields by default final entity state shortcut', () => {

                const localConfig = [{
                    processId: 777,
                    constraints: {
                        bug: {
                            entityStates: [
                                {
                                    name: 'Done',
                                    requiredCustomFields: ['Cf1']
                                }
                            ]
                        }
                    }
                }];

                const axes = [{
                    type: 'entitystate',
                    targetValue: '_final'
                }];

                $ajax.onCall(0).returns(when({
                    items: [{
                        name: 'Rejected',
                        isFinal: true,
                        isDefaultFinal: false,
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            process: {
                                id: 777
                            }
                        }
                    }, {
                        name: 'Done',
                        isFinal: true,
                        isDefaultFinal: true,
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

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(localConfig, axes, processes, entity))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields by selected entity state when team is assigning', () => {

                const axes = [{
                    type: 'assignedteams',
                    targetValue: [{
                        team: {
                            id: 12
                        }
                    }]
                }];

                const entityState = {
                    id: 43
                };

                $ajax.onCall(0).returns(when({
                    items: [{
                        id: 42,
                        name: 'Working On',
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
                    items: []
                }));

                $ajax.onCall(2).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
                    .then(() => getCustomFieldsForAxes(config, axes, processes, {...entity, entityState}))
                    .then((res) => expect(res)
                        .to.be.eql([{
                            name: 'Cf1',
                            id: 1
                        }]));

            });

            it('returns custom fields when change team entity state', () => {

                const axes = [{
                    type: 'teamentitystate',
                    targetValue: [{
                        entityState: {
                            id: 95
                        }
                    }]
                }];

                const projectId = 5;
                const teamId = 32;
                const workflowId = 99;

                $ajax.onCall(0).returns(when({
                    items: [{
                        id: 42,
                        name: 'Working On',
                        entityType: {
                            name: 'Bug'
                        },
                        workflow: {
                            id: workflowId + 1,
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
                            id: workflowId,
                            process: {
                                id: 777
                            }
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{id: 43}]
                }));

                $ajax.onCall(2).returns(when({
                    project: {
                        id: projectId,
                        process: processes[0],
                        teamProjects: {
                            items: [{id: 80}]
                        }
                    },
                    assignedTeams: {
                        items: [{
                            id: 45,
                            team: {
                                id: teamId
                            }
                        }]
                    }
                }));

                $ajax.onCall(3).returns(when({
                    Items: [{
                        project: {
                            id: projectId
                        },
                        team: {
                            id: teamId
                        },
                        workflows: {
                            items: [{
                                entityType: {
                                    name: 'Bug'
                                },
                                parentWorkflow: {
                                    id: workflowId,
                                    entityType: {
                                        name: 'Bug'
                                    }
                                }
                            }]
                        }
                    }]
                }));

                $ajax.onCall(4).returns(when({
                    items: [{
                        name: 'Cf1',
                        id: 1
                    }]
                }));

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
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
                    items: [{
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

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
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
                                requiredCustomFields: ['Cf-calculated', 'Cf-system', 'Cf-regular']
                            }
                        ]
                    }
                }
            }];

            const axes = [{
                type: 'customfield',
                customFieldName: 'cf1',
                targetValue: '42'
            }];

            it('returns custom fields for custom field name', () => {

                $ajax.onCall(0).returns(when({
                    items: [{
                        name: 'Cf1',
                        entityType: {
                            name: 'Bug'
                        }
                    }, {
                        name: 'Cf-regular',
                        entityType: {
                            name: 'Bug'
                        }
                    }]
                }));

                return getCustomFieldsForAxes(config, axes, processes, entity).then((res) => expect(res)
                    .to.be.eql([{
                        name: 'Cf-regular',
                        entityType: {
                            name: 'Bug'
                        }
                    }]));

            });

            it('skips calculated custom fields', () => {

                $ajax.onCall(0).returns(when({
                    items: [{
                        name: 'Cf1',
                        entityType: {
                            name: 'Bug'
                        }
                    }, {
                        name: 'Cf-calculated',
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

            it('skips system custom fields if feature is enabled', () => {

                window.tauFeatures.systemCustomFields = true;

                $ajax.onCall(0).returns(when({
                    items: [{
                        name: 'Cf1',
                        entityType: {
                            name: 'Bug'
                        }
                    }, {
                        name: 'Cf-system',
                        entityType: {
                            name: 'Bug'
                        },
                        isSystem: true
                    }, {
                        name: 'Cf-calculated',
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

            it('returns system custom fields if feature is disabled', () => {

                window.tauFeatures.systemCustomFields = false;

                $ajax.onCall(0).returns(when({
                    items: [{
                        name: 'Cf1',
                        entityType: {
                            name: 'Bug'
                        }
                    }, {
                        name: 'Cf-system',
                        entityType: {
                            name: 'Bug'
                        },
                        isSystem: true
                    }, {
                        name: 'Cf-calculated',
                        entityType: {
                            name: 'Bug'
                        },
                        config: {
                            calculationModel: 42
                        }
                    }]
                }));

                return getCustomFieldsForAxes(config, axes, processes, entity).then((res) => expect(res)
                    .to.be.eql([{
                        name: 'Cf-system',
                        entityType: {
                            name: 'Bug'
                        },
                        isSystem: true
                    }]));

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

            it('remove custom fields if already in axis and entity state has no parent', () => {

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
                    items: [{
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
                    items: []
                }));

                $ajax.onCall(2).returns(when({
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

                $ajax.onCall(3).returns(when({
                    items: [{
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

                return getCustomFieldsForAxes.preloadParentEntityStates(processes)
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
