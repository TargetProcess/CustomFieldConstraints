import {sanitizeFieldValue} from '../Form';

describe('form', () => {

    describe('sanitizeFieldValue()', () => {

        it('transforms', () => {

            const check = (sourceFieldType, sourceValue, target) =>
                expect(sanitizeFieldValue({type: sourceFieldType}, sourceValue)).to.be.eql(target);

            check('text', '', '');
            check('text', ' preved ', 'preved');
            check('number', ' 4 ', '4');
            check('number', ' xz ', 'xz');
            check('number', 4, 4);
            check('richtext', 'preved', 'preved');
            check('multipleselectionlist', ['a', 'b'], ['a', 'b']);

            check('url', {
                url: ' http://porn.com  ',
                label: '  Supersite '
            }, {
                url: 'http://porn.com',
                label: 'Supersite'
            });
            check('url', {
                url: null,
                label: null
            }, {
                url: '',
                label: ''
            });

        });

    });

});
