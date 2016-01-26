import React, {findDOMNode} from 'react/addons';
const tu = React.addons.TestUtils;

import $ from 'jquery';

import FormContainer from '../FormContainer';

describe.skip('FormContainer', () => {

    let $ajax;

    beforeEach(() => {

        $ajax = sinon.stub($, 'ajax');

    });

    afterEach(() => {

        $ajax.restore();

    });

    it('outputs nothing if no config', () => {

        $ajax.returns(new $.Deferred().resolve({items: [{

            name: 'Text',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }

        }]}));

        const entity = {
            id: 777,
            entityType: {
                name: 'userstory'
            }
        };

        const mashupConfig = [{
            processId: 13,
            constraints: {
                task: {
                    entityStates: [{
                        name: 'open',
                        requiredCustomFields: 'Text'
                    }]
                }
            }
        }];

        const dom = tu.renderIntoDocument((
            <FormContainer
                changes={[
                    {
                        type: 'entitystate',
                        targetValue: 'open'
                    }
                ]}
                entity={entity}
                mashupConfig={mashupConfig}
            />
        ));

        expect(findDOMNode(dom))
            .to.be.eql(null);

    });

    it('outputs correct html by required new state', () => {

        $ajax.returns(new $.Deferred().resolve({items: [{

            name: 'Text',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }

        }]}));

        const entity = {
            id: 777,
            entityType: {
                name: 'userstory'
            }
        };

        const mashupConfig = [{
            processId: 13,
            constraints: {
                userstory: {
                    entityStates: [{
                        name: 'open',
                        requiredCustomFields: 'Text'
                    }]
                }
            }
        }];

        const newState = {
            name: 'open'
        };

        const dom = tu.renderIntoDocument((
            <FormContainer
                entity={entity}
                mashupConfig={mashupConfig}
                processId={13}
                requirementsData={{newState}}
            />
            ));

        expect(findDOMNode(dom))
            .property('className')
            .to.be.eql('ui-popup-overlay Overlay-overlay');

        const rows = tu.scryRenderedDOMComponentsWithClass(dom, 'FormRow-block');

        expect(rows)
            .to.have.length(1);

        const row = rows[0];

        expect(findDOMNode(row))
            .property('innerText')
            .to.be.eql('Text');

    });

    it('outputs correct html by required cfs', () => {

        $ajax.returns(new $.Deferred().resolve({items: [{
            name: 'Text',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }

        }, {
            name: 'Pre',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }

        }]}));

        const entity = {
            id: 777,
            entityType: {
                name: 'userstory'
            }
        };

        const mashupConfig = [{
            processId: 13,
            constraints: {
                userstory: {
                    customFields: [{
                        name: 'Pre',
                        valueIn: ['1999'],
                        requiredCustomFields: ['Text']
                    }]
                }
            }
        }];

        const changedCFs = [{
            name: 'Pre',
            value: '1999'
        }];

        const dom = tu.renderIntoDocument((
            <FormContainer
                entity={entity}
                mashupConfig={mashupConfig}
                processId={13}
                requirementsData={{changedCFs}}
            />
            ));

        expect(findDOMNode(dom))
            .property('className')
            .to.be.eql('ui-popup-overlay Overlay-overlay');

        const rows = tu.scryRenderedDOMComponentsWithClass(dom, 'FormRow-block');

        expect(rows)
            .to.have.length(1);

        const row = rows[0];

        expect(findDOMNode(row))
            .property('innerText')
            .to.be.eql('Text');

    });

    it('processes and submits correct fields', () => {

        $ajax.returns(new $.Deferred().resolve({items: [{
            name: 'Text',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }

        }, {
            name: 'Text2',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }

        }]}));

        const entity = {
            id: 777,
            entityType: {
                name: 'userstory'
            },
            customFields: [{
                name: 'Text',
                value: null
            }, {
                name: 'Text2',
                value: 'lala'
            }]
        };

        const mashupConfig = [{
            processId: 13,
            constraints: {
                userstory: {
                    entityStates: [{
                        name: 'open',
                        requiredCustomFields: ['Text']
                    }]
                }
            }
        }];

        const newState = {
            name: 'open'
        };

        const dom = tu.renderIntoDocument((
            <FormContainer
                entity={entity}
                mashupConfig={mashupConfig}
                processId={13}
                requirementsData={{newState}}
            />
            ));

        const getButton = () => {

            return tu.scryRenderedDOMComponentsWithTag(dom, 'button')[0];

        };

        const expectButtonDisabled = (val) => {

            const button = getButton();

            expect(findDOMNode(button))
                .property('disabled')
                .to.be.eql(val);

        };

        const setInputValue = (val) => {

            const input = tu.scryRenderedDOMComponentsWithTag(dom, 'input')[0];

            findDOMNode(input).value = val;
            tu.Simulate.change(findDOMNode(input), {});

        };

        const expectInputClass = (val) => {

            const input = tu.scryRenderedDOMComponentsWithTag(dom, 'input')[0];

            expect(findDOMNode(input))
                .property('className')
                .to.be.eql(val);

        };

        const rows = tu.scryRenderedDOMComponentsWithClass(dom, 'FormRow-block');

        expect(rows)
            .to.have.length(1);

        expectInputClass('tau-in-text');
        expectButtonDisabled(true);

        setInputValue(' ');
        expectInputClass('tau-in-text tau-error');
        expectButtonDisabled(true);

        setInputValue(' preved ');
        expectInputClass('tau-in-text');
        expectButtonDisabled(false);

        const form = findDOMNode(tu.scryRenderedDOMComponentsWithTag(dom, 'form')[0]);

        tu.Simulate.submit(form);

        expect($ajax)
            .to.be.calledTwice;

        const submitCall = $ajax.getCall(1);

        expect(submitCall.args[0].data)
            .to.be.eql(JSON.stringify({
                customFields: [{
                    name: 'Text',
                    value: 'preved'
                }]
            }));

    });

    it('processes and submits correct fields with deps', () => {

        $ajax.returns(new $.Deferred().resolve({items: [{
            name: 'Text',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }

        }, {
            name: 'Text2',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }

        }]}));

        const entity = {
            id: 777,
            entityType: {
                name: 'userstory'
            }
        };

        const mashupConfig = [{
            processId: 13,
            constraints: {
                userstory: {
                    entityStates: [{
                        name: 'open',
                        requiredCustomFields: ['Text']
                    }],
                    customFields: [{
                        name: 'Text',
                        valueIn: ['777'],
                        requiredCustomFields: ['Text2']
                    }]
                }
            }
        }];

        const newState = {
            name: 'open'
        };

        const dom = tu.renderIntoDocument((
            <FormContainer
                entity={entity}
                mashupConfig={mashupConfig}
                processId={13}
                requirementsData={{newState}}
            />
            ));

        const getButton = () => {

            return tu.scryRenderedDOMComponentsWithTag(dom, 'button')[0];

        };

        const expectButtonDisabled = (val) => {

            const button = getButton();

            expect(findDOMNode(button))
                .property('disabled')
                .to.be.eql(val);

        };

        const setInputValue = (index, val) => {

            const input = tu.scryRenderedDOMComponentsWithTag(dom, 'input')[index];

            findDOMNode(input).value = val;
            tu.Simulate.change(findDOMNode(input), {});

        };

        const expectInputClass = (index, val) => {

            const input = tu.scryRenderedDOMComponentsWithTag(dom, 'input')[index];

            expect(findDOMNode(input))
                .property('className')
                .to.be.eql(val);

        };

        let rows = tu.scryRenderedDOMComponentsWithClass(dom, 'FormRow-block');

        expect(rows)
            .to.have.length(1);

        expectInputClass(0, 'tau-in-text');
        expectButtonDisabled(true);

        setInputValue(0, ' 777 ');
        expectInputClass(0, 'tau-in-text');
        expectButtonDisabled(true);

        rows = tu.scryRenderedDOMComponentsWithClass(dom, 'FormRow-block');
        expect(rows)
            .to.have.length(2);

        expectInputClass(1, 'tau-in-text');
        expectButtonDisabled(true);

        setInputValue(1, ' 888 ');
        expectButtonDisabled(false);

        let form = findDOMNode(tu.scryRenderedDOMComponentsWithTag(dom, 'form')[0]);

        tu.Simulate.submit(form);

        expect($ajax)
            .to.be.calledTwice;

        let submitCall = $ajax.getCall(1);

        expect(submitCall.args[0].data)
            .to.be.eql(JSON.stringify({
                customFields: [{
                    name: 'Text',
                    value: '777'
                }, {
                    name: 'Text2',
                    value: '888'
                }]
            }));

        setInputValue(0, ' 555 ');
        rows = tu.scryRenderedDOMComponentsWithClass(dom, 'FormRow-block');
        expect(rows)
            .to.have.length(1);
        expectButtonDisabled(false);

        form = findDOMNode(tu.scryRenderedDOMComponentsWithTag(dom, 'form')[0]);

        tu.Simulate.submit(form);

        submitCall = $ajax.getCall(2);

        expect(submitCall.args[0].data)
            .to.be.eql(JSON.stringify({
                customFields: [{
                    name: 'Text',
                    value: '555'
                }]
            }));

    });

    it('fires callbacks on save or cancel', () => {

        $ajax.returns(new $.Deferred().resolve({items: [{
            name: 'Text',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }
        }]}));

        const entity = {
            id: 777,
            entityType: {
                name: 'userstory'
            }
        };

        const mashupConfig = [{
            processId: 13,
            constraints: {
                userstory: {
                    entityStates: [{
                        name: 'open',
                        requiredCustomFields: ['Text']
                    }]
                }
            }
        }];

        const newState = {
            name: 'open'
        };

        const onAfterSave = sinon.spy();
        const onCancel = sinon.spy();

        const dom = tu.renderIntoDocument((
            <FormContainer
                entity={entity}
                mashupConfig={mashupConfig}
                onAfterSave={onAfterSave}
                onCancel={onCancel}
                processId={13}
                requirementsData={{newState}}
            />
            ));

        const setInputValue = (index, val) => {

            const input = tu.scryRenderedDOMComponentsWithTag(dom, 'input')[index];

            findDOMNode(input).value = val;
            tu.Simulate.change(findDOMNode(input), {});

        };

        const form = findDOMNode(tu.scryRenderedDOMComponentsWithTag(dom, 'form')[0]);

        tu.Simulate.submit(form);

        expect(onAfterSave)
            .to.be.not.called;
        expect($ajax)
            .to.be.calledOnce;

        setInputValue(0, '  haha  ');
        tu.Simulate.submit(form);
        expect($ajax)
            .to.be.calledTwice;
        expect(onAfterSave)
            .to.be.calledOnce;

        const close = tu.scryRenderedDOMComponentsWithClass(dom, 'close')[0];

        expect(onCancel)
            .to.be.not.called;

        tu.Simulate.click(close);

        expect(onCancel)
            .to.be.calledOnce;

    });

    it('processes server errors', () => {

        $ajax.returns(new $.Deferred().resolve({items: [{
            name: 'Text',
            fieldType: 'Text',
            config: {
                defaultValue: null
            }
        }]}));

        const entity = {
            id: 777,
            entityType: {
                name: 'userstory'
            }
        };

        const mashupConfig = [{
            processId: 13,
            constraints: {
                userstory: {
                    entityStates: [{
                        name: 'open',
                        requiredCustomFields: ['Text']
                    }]
                }
            }
        }];

        const newState = {
            name: 'open'
        };

        const onAfterSave = sinon.spy();
        const onCancel = sinon.spy();

        const dom = tu.renderIntoDocument((
            <FormContainer
                entity={entity}
                mashupConfig={mashupConfig}
                onAfterSave={onAfterSave}
                onCancel={onCancel}
                processId={13}
                requirementsData={{newState}}
            />
            ));

        const setInputValue = (index, val) => {

            const input = tu.scryRenderedDOMComponentsWithTag(dom, 'input')[index];

            findDOMNode(input).value = val;
            tu.Simulate.change(findDOMNode(input), {});

        };

        const getError = () => tu.scryRenderedDOMComponentsWithClass(dom, 'FormContainer-error')[0] || null;

        const form = findDOMNode(tu.scryRenderedDOMComponentsWithTag(dom, 'form')[0]);

        setInputValue(0, '  haha  ');

        expect(getError())
            .to.be.eql(null);

        $ajax.returns(new $.Deferred().reject({responseJSON: {Message: 'This is error'}}));
        tu.Simulate.submit(form);
        expect($ajax)
            .to.be.calledTwice;
        expect(onAfterSave)
            .to.be.notCalled;

        expect(findDOMNode(getError()).innerText)
            .to.be.eql('This is error');

        $ajax.returns(new $.Deferred().reject('Nothing here'));
        tu.Simulate.submit(form);
        expect(onAfterSave)
            .to.be.notCalled;
        expect(findDOMNode(getError()).innerText)
            .to.be.eql('Error while saving');

    });

});
