import {
    lc,
    equalIgnoreCase,
    equalByShortcut,
    inValues,

    isGeneral,
    isAssignable,
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

        expect(equalByShortcut('_Final', {isFinal: true})).to.be.true;
        expect(equalByShortcut('_final', {isFinal: true})).to.be.true;
        expect(equalByShortcut('_final', {isFinal: false})).to.be.false;
        expect(equalByShortcut('_initial', {isInitial: true})).to.be.true;
        expect(equalByShortcut('_planned', {isPlanned: true})).to.be.true;

    });

    it('inValues()', () => {

        expect(inValues(['foo', 'bar'], 'FOO')).to.be.true;
        expect(inValues(['foo', 'bar'], 'BAZ')).to.be.false;

        expect(inValues(['foo', 'bar'], ['FOO'])).to.be.true;

    });

    it('isGeneral()', () => {

        expect(isGeneral({entityType: {name: 'general'}})).to.be.true;
        expect(isGeneral({entityType: {name: 'bug'}})).to.be.true;
        expect(isGeneral({entityType: {name: 'user'}})).to.be.false;

    });

    it('isAssignable()', () => {

        expect(isAssignable({entityType: {name: 'general'}})).to.be.false;
        expect(isAssignable({entityType: {name: 'bug'}})).to.be.true;
        expect(isAssignable({entityType: {name: 'user'}})).to.be.false;

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
                    task: {}
                }
            },
            {
                constraints: {
                    user: {}
                }
            }
        ])).to.be.eql(['bug', 'task', 'user']);

    });

    it('isStateRelated()', () => {

        expect(isStateRelated('entityState')).to.be.true;
        expect(isStateRelated('assignedTeams')).to.be.true;
        expect(isStateRelated('TeamEntityState')).to.be.true;
        expect(isStateRelated('customFields')).to.be.false;

    });

});
