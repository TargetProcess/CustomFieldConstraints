/* eslint-disable */
import {isArray, isObject, object, map} from 'underscore';
import {ajax} from 'jquery';
import configurator from 'tau/configurator';

const types = configurator.getStore().getTypes().getDictionary();
const appPath = configurator.getApplicationPath();

const getResource = (typeName) => types[typeName.toLowerCase()].resource;
const getResourceUrl = (path) => `${appPath}/api/v2/${path}`;

const request = (type, url, params) => {

    return ajax({
        type: type,
        url: url,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: params
    });

};

const load = (resource, params) => {

    const loadPages = (url, params) => {

        return request('get', url, params)
            .then((res) =>  {
                const items = res.items;
                const next = res.next;

                if (next) {
                    return loadPages(next).then(items.concat.bind(items));
                }

                return items;
            });
    };

    return loadPages(resource, params);
};

const processResult = (result) => {

    if (isArray(result)) {
        return result.map((v) => processResult(v));
    }

    if (isObject(result)) {
        return object(map(result, (v, k) => {
            const key = k[0].toLowerCase() + k.slice(1);

            if (key === 'items' && isArray(v)) {
                return processResult(v);
            }

            return [key, processResult(v)];
        }));
    }

    return result;
};

const processOpts = (options = {}, defaultOpts = {take: 1000}) => ({...defaultOpts, ...options});

module.exports = {

    get() {

        const args = Array.prototype.slice.call(arguments);

        if (args.length === 3) {
            return request('GET', getResourceUrl(getResource(args[0]) + '/' + args[1]), processOpts(args[2]))
                .then(processResult);
        }

        return load(getResourceUrl(args[0]), processOpts(args[1])).then(processResult);
    }

};
