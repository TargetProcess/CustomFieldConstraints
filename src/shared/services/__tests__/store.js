import store from 'services/store';
import $ from 'jquery';

describe('store', () => {

    let $ajax;

    beforeEach(() => {

        $ajax = sinon.stub($, 'ajax');

    });

    afterEach(() => {

        $ajax.restore();

    });

    describe('get', () => {

        it('get calls ajax', () => {

            $ajax.returns({

                then(callback) {

                    callback({

                        Items: []

                    });

                    return this;

                }

            });

            store.get('userstory').then(() => {

                expect(true).to.be.true;

            });

        });

        it('get paging works', () => {

            let thenCallsCount = 0;

            $ajax.returns({

                then(callback) {

                    ++thenCallsCount;

                    callback({

                        Items: [],
                        Next: thenCallsCount === 1 ? 'next' : null

                    });

                    return this;

                }

            });

            store.get('userstory').then(() => {

                // root + paging (2) + process + this = 5.
                expect(thenCallsCount).equals(5);

            });

        });

    });

});
