import decodeSliceValue from '../decodeSliceValue';

describe('decodeSliceValue', () => {

    it('decodes', () => {

        expect(decodeSliceValue('')).to.be.equal('');
        expect(decodeSliceValue(null)).to.be.equal(null);
        expect(decodeSliceValue('foo')).to.be.equal('foo');

        expect(decodeSliceValue('b64_NDg4_')).to.be.equal('488');
        expect(decodeSliceValue('b64_///')).to.be.equal('');

    });

});
