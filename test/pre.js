import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
window.expect = chai.use(chaiEnzyme()).expect;

window.console.warn = (text) => {

    throw new Error(text);

};
