import {pluck} from 'underscore';

import {
    transformFieldFromServer,
    transformToServerFieldValue,
    sanitizeFieldValue,
    validateFieldValue
} from '../form';

describe.skip('form', () => {

    describe('transformFieldFromServer', () => {

        it('transforms', () => {

            const check = (source, target) => expect(transformFieldFromServer(source)).to.be.eql(target);

            check({
                name: 'Ftext',
                fieldType: 'Text',
                config: {
                    defaultValue: null
                }
            }, {
                name: 'Ftext',
                fieldType: 'Text',
                type: 'text',
                config: {
                    defaultValue: null
                }
            });

            check({
                fieldType: 'Dropdown',
                config: {
                    defaultValue: 'a'
                },
                value: 'a\r\nb\r\n'
            }, {
                fieldType: 'Dropdown',
                type: 'dropdown',
                config: {
                    defaultValue: 'a'
                },
                value: ['a', 'b']
            });

            check({
                fieldType: 'MultipleselectionList',
                config: {
                    defaultValue: 'a,c'
                },
                value: 'a\r\nb\r\nc'
            }, {
                fieldType: 'MultipleselectionList',
                type: 'multipleselectionlist',
                config: {
                    defaultValue: ['a', 'c']
                },
                value: ['a', 'b', 'c']
            });

            check({
                fieldType: 'MultipleselectionList',
                config: {
                    defaultValue: null
                },
                value: null
            }, {
                fieldType: 'MultipleselectionList',
                type: 'multipleselectionlist',
                config: {
                    defaultValue: []
                },
                value: []
            });

        });

    });

    describe('transformToServerFieldValue()', () => {

        it('transforms', () => {

            const check = (sourceFieldType, sourceValue, target) =>
                expect(transformToServerFieldValue({type: sourceFieldType}, sourceValue)).to.be.eql(target);

            check('text', '', '');
            check('text', ' preved ', ' preved ');
            check('number', '4', '4');
            check('number', 4, 4);

            check('richtext', 'preved', 'preved');
            expect(transformToServerFieldValue({
                type: 'richtext'
            }, 'preved')).to.be.eql('preved');

            check('multipleselectionlist', ['a', 'b'], 'a,b');
            check('entity', {
                id: 112,
                name: 'Supertask',
                entityType: {name: 'Task'},
                entityState: {name: 'Open'}
            }, {
                id: 112,
                name: 'Supertask',
                kind: 'Task'
            });

        });

    });

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

        });

    });

    describe('validateFieldValue()', () => {

        it('returns errors', () => {

            const check = (sourceFieldType, sourceValue, target) =>
                expect(pluck(validateFieldValue({type: sourceFieldType}, sourceValue), 'message')).to.be.eql(target);

            check('text', '', ['Field is empty']);
            check('text', ' preved ', []);

            check('number', '', ['Field is empty']);
            check('number', '0', []);
            check('number', ' 4 ', []);
            check('number', ' xz ', []);

            check('multipleselectionlist', [], ['Field is empty']);
            check('url', {
                url: ' http://porn.com  ',
                label: '   '
            }, ['Field is empty']);

        });

    });

});
