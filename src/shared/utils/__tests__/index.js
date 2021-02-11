import {
    lc,
    equalIgnoreCase,
    equalByShortcut,
    inValues,

    isGeneral,
    isAssignable,
    isRequester,
    isUser,

    getEntityTypesNamesFromConfig,
    isStateRelated
} from '../index';

describe('utils', () => {

    it('lc()', () => {

        expect(lc('PreVed'))
            .to.be.equal('preved');

    });

    it('equalIgnoreCase()', () => {

        expect(equalIgnoreCase('preved', 'PREVed'))
            .to.be.true;

        expect(equalIgnoreCase('preved', 'hello'))
            .to.be.false;

    });

    it('equalByShortcut()', () => {

        expect(equalByShortcut('_Final', {isFinal: true, isDefaultFinal: true})).to.be.true;
        expect(equalByShortcut('_final', {isFinal: true, isDefaultFinal: true})).to.be.true;
        expect(equalByShortcut('_Final', {isFinal: true, isDefaultFinal: false})).to.be.false;
        expect(equalByShortcut('_final', {isFinal: true, isDefaultFinal: false})).to.be.false;
        expect(equalByShortcut('_final', {isFinal: false, isDefaultFinal: false})).to.be.false;
        expect(equalByShortcut('_initial', {isInitial: true, isDefaultFinal: false})).to.be.true;
        expect(equalByShortcut('_planned', {isPlanned: true, isDefaultFinal: false})).to.be.true;

    });

    it('inValues()', () => {

        expect(inValues(['foo', 'bar'], 'FOO')).to.be.true;
        expect(inValues(['foo', 'bar'], 'BAZ')).to.be.false;

        expect(inValues(['foo', 'bar'], ['FOO'])).to.be.true;

    });

    it('isGeneral()', () => {

        expect(isGeneral({entityType: {name: 'general'}})).to.be.true;
        expect(isGeneral({entityType: {name: 'bug'}})).to.be.true;
        expect(isGeneral({entityType: {name: 'portfolioEpic'}})).to.be.true;
        expect(isGeneral({entityType: {name: 'keyResult'}})).to.be.true;
        expect(isGeneral({entityType: {name: 'user'}})).to.be.false;

    });

    it('isAssignable()', () => {

        expect(isAssignable({entityType: {name: 'general'}})).to.be.false;
        expect(isAssignable({entityType: {name: 'assignable'}})).to.be.true;
        expect(isAssignable({entityType: {name: 'bug'}})).to.be.true;
        expect(isAssignable({entityType: {name: 'portfolioEpic'}})).to.be.true;
        expect(isAssignable({entityType: {name: 'keyResult'}})).to.be.true;
        expect(isAssignable({entityType: {name: 'user'}})).to.be.false;
        expect(isAssignable({entityType: {name: 'project'}})).to.be.false;
        expect(isAssignable({entityType: {name: 'objective'}})).to.be.false;

    });

    it('isRequester()', () => {

        expect(isRequester({entityType: {name: 'requester'}})).to.be.true;
        expect(isRequester({entityType: {name: 'user'}})).to.be.false;
        expect(isRequester({entityType: {name: 'generaluser'}})).to.be.false;
        expect(isRequester({entityType: {name: 'bug'}})).to.be.false;

    });

    it('isUser()', () => {

        expect(isUser({entityType: {name: 'user'}})).to.be.true;
        expect(isUser({entityType: {name: 'requester'}})).to.be.true;
        expect(isUser({entityType: {name: 'generaluser'}})).to.be.true;
        expect(isUser({entityType: {name: 'bug'}})).to.be.false;

    });

    it('getEntityTypesNamesFromConfig()', () => {

        expect(getEntityTypesNamesFromConfig([
            {
                processId: 123,
                constraints: {
                    bug: {},
                    task: {},
                    portfolioepic: {}
                }
            },
            {
                constraints: {
                    user: {}
                }
            }
        ])).to.be.eql(['bug', 'task', 'portfolioepic', 'user']);

    });

    it('isStateRelated()', () => {

        expect(isStateRelated('entityState')).to.be.true;
        expect(isStateRelated('assignedTeams')).to.be.true;
        expect(isStateRelated('TeamEntityState')).to.be.true;
        expect(isStateRelated('customFields')).to.be.false;

    });

});
