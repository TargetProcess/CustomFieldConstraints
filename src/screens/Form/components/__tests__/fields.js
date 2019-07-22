import {fields, getFieldValue} from '../../fields';

describe('fields', () => {

    describe('getFieldValue', () => {

        it('should get field value for positive integer number as is', () => {

            const value = getFieldValue({customField: {type: 'number'}, value: 12});

            expect(value).to.be.eql(12);

        });

        it('should get field value for negative integer number as is', () => {

            const value = getFieldValue({customField: {type: 'number'}, value: -9});

            expect(value).to.be.eql(-9);

        });

        it('should get field value for rational number as is', () => {

            const value = getFieldValue({customField: {type: 'number'}, value: 0.356});

            expect(value).to.be.eql(0.356);

        });

        it('should get field value for string number', () => {

            const value = getFieldValue({customField: {type: 'number'}, value: '9.58'});

            expect(value).to.be.eql(9.58);

        });

        it('should pass field value as is when number not number', () => {

            const value = getFieldValue({customField: {type: 'number'}, value: 'Text'});

            expect(value).to.be.eql('Text');

        });

        it('should get field value for money as is', () => {

            const value = getFieldValue({customField: {type: 'money'}, value: 103});

            expect(value).to.be.eql(103);

        });

        it('should get field value for money string', () => {

            const value = getFieldValue({customField: {type: 'money'}, value: '10.73'});

            expect(value).to.be.eql(10.73);

        });

        it('should pass field value as is when money not money', () => {

            const value = getFieldValue({customField: {type: 'money'}, value: 'El pu'});

            expect(value).to.be.eql('El pu');

        });

        it('should pass field value as is when no field value parser found', () => {

            const value = getFieldValue({customField: {type: 'multipleselectionlist'}, value: ['a', 'b']});

            expect(value).to.be.eql(['a', 'b']);

        });

    });

    describe('fields', () => {

        it('should pass null or empty number as is in format', () => {

            const value1 = fields.number.format(null);

            expect(value1).to.be.eql(null);

            const value2 = fields.number.format('');

            expect(value2).to.be.eql('');

        });

        it('should apply formatting for number in format', () => {

            const value1 = fields.number.format(12.54);

            expect(value1).to.be.eql('12.54');

        });

        it('should pass null or empty number as is in invariant', () => {

            const value1 = fields.number.invariant(null);

            expect(value1).to.be.eql(null);

            const value2 = fields.number.invariant('');

            expect(value2).to.be.eql('');

        });

        it('should apply formatting for number in invariant', () => {

            const value1 = fields.number.invariant('12.54');

            expect(value1).to.be.eql('12.54');

        });

        it('should pass null or empty money as is in format', () => {

            const value1 = fields.money.format(null);

            expect(value1).to.be.eql(null);

            const value2 = fields.money.format('');

            expect(value2).to.be.eql('');

        });

        it('should apply formatting for money in format', () => {

            const value1 = fields.money.format(17.01);

            expect(value1).to.be.eql('17.01');

        });

        it('should pass null or empty money as is in invariant', () => {

            const value1 = fields.money.invariant(null);

            expect(value1).to.be.eql(null);

            const value2 = fields.money.invariant('');

            expect(value2).to.be.eql('');

        });

        it('should apply formatting for money in invariant', () => {

            const value1 = fields.money.invariant('17.01');

            expect(value1).to.be.eql('17.01');

        });

    });

});

