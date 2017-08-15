import decodeSliceValue from '../decodeSliceValue';

describe('decodeSliceValue', () => {

    it('decodes', () => {

        expect(decodeSliceValue('')).to.be.equal('');
        expect(decodeSliceValue(null)).to.be.equal(null);
        expect(decodeSliceValue('foo')).to.be.equal('foo');

        expect(decodeSliceValue('b64_NDg4_')).to.be.equal('488');
        // Is not base64, should be 'b64_*_'.
        expect(decodeSliceValue('b64_')).to.be.equal('b64_');
        // Is not base64.
        expect(decodeSliceValue('b64_///_')).to.be.equal('b64_///_');
        // Nothing in body.
        expect(decodeSliceValue('b64__')).to.be.equal('');

        // Special symbols.
        expect(decodeSliceValue('b64_aW4gcHJvZ3Jlc3Mh_')).to.be.equal('in progress!');
        // Unicode.
        expect(decodeSliceValue('b64_0YLQtdGB0YLQuNGA0YPQtdGC0YHRjw_2_2_')).to.be.equal('тестируется');

        expect(decodeSliceValue(24)).to.be.equal(24);
        expect(decodeSliceValue('24')).to.be.equal(24);

    });

});
