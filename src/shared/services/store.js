/* eslint-disable */
import {isArray, isObject, object, map} from 'underscore';
import {ajax} from 'jquery';
import configurator from 'tau/configurator';

const types = configurator.getStore().getTypes().getDictionary();
const appPath = configurator.getApplicationPath();

const stringify = (obj) => {

    let res = '';

    if (obj) {
        if (Array.isArray(obj)) {

            res = obj.map(stringify).join(",");
        } else if (typeof obj === "object") {

            res = Object.keys(obj).map((key) => `${key}[${stringify(obj[key])}]`).join(',');
        } else if (typeof obj !== "function") {

            res = String(obj);
        }
    }

    return res;
};

const getResource = (typeName) => types[typeName.toLowerCase()].resource;

const requestPost = (type, path, params) => {

    return ajax({
        type: type,
        url: `${appPath}/api/v1/${path}`,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(params)
    });

};

const request = (type, path, params) => {

    return ajax({
        type: type,
        url: path.absolute || `${appPath}/api/v1/${path}`,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: params
    });

};

const load = (resource, params) => {

    const loadPages = (url, params) => {

        return request('get', url, params)
            .then((res) => {
                const items = res.Items;
                const next = res.Next;

                if (next) {
                    return loadPages({absolute: next}).then(items.concat.bind(items));
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

            if (key === 'Items' && isArray(v)) {
                return processResult(v);
            }

            return [key, processResult(v)];
        }));
    }

    return result;
};

const processOpts = (options = {}, defaultOpts = {take: 1000}) => {

    const opts = {...defaultOpts, ...options};

    if (options.include && typeof options.include !== 'string') {
        opts.include = `[${stringify(options.include)}]`;
    }

    return opts;
};

module.exports = {

    get() {

        const args = Array.prototype.slice.call(arguments);

        if (args.length === 3) {
            return request('GET', getResource(args[0]) + '/' + args[1], processOpts(args[2])).then(processResult);
        }

        return load(args[0], processOpts(args[1])).then(processResult);
    },

    remove(collection, id) {
        return request('DELETE', getResource(collection) + '/' + id);
    },

    create(collection, data) {
        return requestPost('POST', getResource(collection), data);
    },

    save(collection, id, data) {
        return requestPost('POST', getResource(collection) + '/' + id, data);
    }

};
