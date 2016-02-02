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
                        }
                    }, {
                        id: 43,
                        name: 'Open',
                        entityType: {
                            name: 'Bug'
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1'
                    }]
                }));

                return getCustomFieldsForAxes(config, axes, processes, entity).then((res) => expect(res)
                    .to.be.eql([{
                        name: 'Cf1'
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
                        }
                    }, {
                        name: 'Open',
                        entityType: {
                            name: 'UserStory'
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1'
                    }]
                }));

                return getCustomFieldsForAxes(config, axes, processes, entity).then((res) => expect(res)
                    .to.be.eql([{
                        name: 'Cf1'
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
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1'
                    }]
                }));

                return getCustomFieldsForAxes(config, axes, processes, entity).then((res) => expect(res)
                    .to.be.eql([{
                        name: 'Cf1'
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
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1'
                    }]
                }));

                return getCustomFieldsForAxes(config, axes, processes, entity).then((res) => {

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
                        }
                    }]
                }));

                $ajax.onCall(1).returns(when({
                    items: [{
                        name: 'Cf1'
                    }, {
                        name: 'Cf2'
                    }, {
                        name: 'Cf3'
                    }, {
                        name: 'Cf0'
                    }]
                }));

                return getCustomFieldsForAxes(config, axes, processes, entity).then((res) => expect(res)
                    .to.be.eql([{
                        name: 'Cf0'
                    }, {
                        name: 'Cf2'
                    }, {
                        name: 'Cf3'
                    }]));

            });

        });

    });

});
