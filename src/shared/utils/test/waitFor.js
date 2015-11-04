import Promise from 'bluebird';

const waitFor = (testFx, onReady, onFailure, timeOutMillis) => {

    const maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000;
    const start = new Date().getTime();
    let condition = false;
    const interval = setInterval(() => {

        if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {

            condition = testFx();

        } else if (!condition) {

            clearInterval(interval);
            onFailure();

        } else {

            onReady();
            clearInterval(interval);

        }

    }, 250);

};

export default (predicate, timeout = 2000) => {

    return new Promise((resolve, reject) => waitFor(predicate, resolve, reject, timeout));

};
