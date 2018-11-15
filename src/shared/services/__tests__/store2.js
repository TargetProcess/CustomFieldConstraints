import store2 from 'services/store2';
import $ from 'jquery';

describe('store2', () => {

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

                        items: []

                    });

                    return this;

                }

            });

            store2.get('userstory').then(() => {

                expect(true).to.be.true;

            });

        });

        it('get paging works', () => {

            let thenCallsCount = 0;

            $ajax.returns({

                then(callback) {

                    ++thenCallsCount;

                    callback({

                        items: [],
                        next: thenCallsCount === 1 ? 'next' : null

                    });

                    return this;

                }

            });

            store2.get('userstory').then(() => {

                // root + paging (2) + process + this = 5.
                expect(thenCallsCount).equals(5);

            });

        });

    });

});
