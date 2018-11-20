import {isEmptyCheckboxValue, fromServerValue, getCustomFieldValue} from 'services/CustomFieldValue';
import dateUtils from 'tau/utils/utils.date';

describe('CustomFieldValue', () => {

    describe('isEmptyCheckboxValue()', () => {

        it('checks checkbox value empty', () => {

            expect(isEmptyCheckboxValue(0)).to.be.false;
            expect(isEmptyCheckboxValue(null)).to.be.false;
            expect(isEmptyCheckboxValue(true)).to.be.false;
            expect(isEmptyCheckboxValue(1)).to.be.false;
            expect(isEmptyCheckboxValue(false)).to.be.true;

        });

    });

    describe('fromServerValue()', () => {

        it('transforms multiselect', () => {

            expect(fromServerValue({
                name: 'msl',
                type: 'multipleselectionlist'
            }, null)).to.be.eql({
                name: 'msl',
                customField: {
                    name: 'msl',
                    type: 'multipleselectionlist'
                },
                value: [],
                isEmpty: true,
                serverValue: ''
            });
            expect(fromServerValue({
                name: 'msl',
                type: 'multipleselectionlist'
            }, 'a')).to.be.eql({
                name: 'msl',
                customField: {
                    name: 'msl',
                    type: 'multipleselectionlist'
                },
                value: ['a'],
                isEmpty: false,
                serverValue: 'a'
            });
            expect(fromServerValue({
                name: 'msl',
                type: 'multipleselectionlist'
            }, 'a,b')).to.be.eql({
                name: 'msl',
                customField: {
                    name: 'msl',
                    type: 'multipleselectionlist'
                },
                value: ['a', 'b'],
                isEmpty: false,
                serverValue: 'a,b'
            });

        });

        it('transforms url', () => {

            expect(fromServerValue({
                name: 'u',
                type: 'url'
            }, null)).to.be.eql({
                name: 'u',
                customField: {
                    name: 'u',
                    type: 'url'
                },
                value: {},
                isEmpty: true,
                serverValue: {}
            });
            expect(fromServerValue({
                name: 'u',
                type: 'url'
            }, {url: 'url', label: 'label'})).to.be.eql({
                name: 'u',
                customField: {
                    name: 'u',
                    type: 'url'
                },
                value: {url: 'url', label: 'label'},
                isEmpty: false,
                serverValue: {url: 'url', label: 'label'}
            });

        });

        it('transforms date', () => {

            expect(fromServerValue({
                name: 'd',
                type: 'date'
            }, null)).to.be.eql({
                name: 'd',
                customField: {
                    name: 'd',
                    type: 'date'
                },
                value: null,
                isEmpty: true,
                serverValue: null
            });

            // Sinon version is too old to stub objects :(
            const stub = (obj, prop, newProp) => {

                const oldProp = obj[prop];

                /* eslint-disable no-param-reassign */
                obj[prop] = newProp;
                obj[prop].restore = function() {

                    obj[prop] = oldProp;
                    /* eslint-enable no-param-reassign */

                };

            };

            stub(dateUtils, 'format', {
                date: {
                    short: () => '11/11/2018'
                }
            });
            stub(dateUtils, 'parseToServerDateTime', () => '11/11/2018');

            expect(fromServerValue({
                name: 'd',
                type: 'date'
            }, '11 11 2018')).to.be.eql({
                name: 'd',
                customField: {
                    name: 'd',
                    type: 'date'
                },
                value: '11/11/2018',
                isEmpty: false,
                serverValue: '11/11/2018'
            });

            dateUtils.parseToServerDateTime.restore();
            dateUtils.format.restore();

        });

        it('transforms entity', () => {

            expect(fromServerValue({
                name: 'e',
                type: 'entity'
            }, null)).to.be.eql({
                name: 'e',
                customField: {
                    name: 'e',
                    type: 'entity'
                },
                value: null,
                isEmpty: true,
                serverValue: null
            });

            expect(fromServerValue({
                name: 'e',
                type: 'entity'
            }, {id: 12, kind: 'bug', name: 'fixme'})).to.be.eql({
                name: 'e',
                customField: {
                    name: 'e',
                    type: 'entity'
                },
                value: {
                    id: 12,
                    name: 'fixme',
                    entityType: {
                        name: 'bug'
                    }
                },
                isEmpty: false,
                serverValue: {id: 12, kind: 'bug', name: 'fixme'}
            });

        });

        it('transforms multipleentities', () => {

            expect(fromServerValue({
                name: 'me',
                type: 'multipleentities'
            }, null)).to.be.eql({
                name: 'me',
                customField: {
                    name: 'me',
                    type: 'multipleentities'
                },
                value: [],
                isEmpty: true,
                serverValue: ''
            });

            expect(fromServerValue({
                name: 'me',
                type: 'multipleentities'
            }, '12 bug,15 userstory')).to.be.eql({
                name: 'me',
                customField: {
                    name: 'me',
                    type: 'multipleentities'
                },
                value: [{
                    id: 12,
                    entityType: {
                        name: 'bug'
                    }
                }, {
                    id: 15,
                    entityType: {
                        name: 'userstory'
                    }
                }],
                isEmpty: false,
                serverValue: '12 bug,15 userstory'
            });

        });

        it('transforms text', () => {

            expect(fromServerValue({
                name: 't',
                type: 'text'
            }, null)).to.be.eql({
                name: 't',
                customField: {
                    name: 't',
                    type: 'text'
                },
                value: null,
                isEmpty: true,
                serverValue: null
            });

            expect(fromServerValue({
                name: 't',
                type: 'text'
            }, 'smth')).to.be.eql({
                name: 't',
                customField: {
                    name: 't',
                    type: 'text'
                },
                value: 'smth',
                isEmpty: false,
                serverValue: 'smth'
            });

        });

        it('transforms number', () => {

            expect(fromServerValue({
                name: 'n',
                type: 'number'
            }, null)).to.be.eql({
                name: 'n',
                customField: {
                    name: 'n',
                    type: 'number'
                },
                value: null,
                isEmpty: true,
                serverValue: null
            });

            expect(fromServerValue({
                name: 'n',
                type: 'number'
            }, 12)).to.be.eql({
                name: 'n',
                customField: {
                    name: 'n',
                    type: 'number'
                },
                value: 12,
                isEmpty: false,
                serverValue: 12
            });

        });

    });

    describe('getCustomFieldValue()', () => {

        it('gets custom field value', () => {

            expect(getCustomFieldValue({type: 'checkbox', value: true})).to.be.true;
            expect(getCustomFieldValue({type: 'checkbox', value: false})).to.be.false;
            expect(getCustomFieldValue({type: 'checkbox', value: null})).to.be.false;
            expect(getCustomFieldValue({type: 'text', value: null})).to.be.null;
            expect(getCustomFieldValue({type: 'text', value: 'abc'})).to.be.equal('abc');
            expect(getCustomFieldValue({type: 'number', value: 12})).to.be.equal(12);
            expect(getCustomFieldValue({type: 'url', value: {url: 'abc', label: 'def'}})).to
                .be.eql({url: 'abc', label: 'def'});

        });

    });

});
