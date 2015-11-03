/* eslint-disable */
var $ = require('jquery');

var configurator = require('tau/configurator');

var types = configurator.getStore().getTypes().getDictionary();
var appPath = configurator.getApplicationPath();

var stringify = function(obj) {

    var res = "";

    if (obj) {
        if (Array.isArray(obj)) {

            res = obj.map(stringify).join(",");
        } else if (typeof obj === "object") {

            res = Object.keys(obj).map(function(key) {
                return key + "[" + stringify(obj[key]) + "]";
            }).join(",");
        } else if (typeof obj !== "function") {

            res = String(obj);
        }
    }

    return res;
};

var getResource = function(typeName) {
    return types[typeName.toLowerCase()].resource;
};

var requestPost = function(type, path, params) {

    return $.ajax({
        type: type,
        url: appPath + '/api/v1/' + path,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(params)
    });

};

var request = function(type, path, params) {

    return $.ajax({
        type: type,
        url: appPath + '/api/v1/' + path,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: params
    });

};

var load = function(resource, params) {

    var loadPages = function loadPages(url, params) {

        return request('get', url, params)
            .then(function(res) {
                var items = res.Items;
                if (res.Next) {
                    return loadPages(res.Next).then(items.concat.bind(items));
                } else {
                    return items;
                }
            });
    };

    return loadPages(resource, params);
};

var processResult = function(result) {

    if (_.isArray(result)) {
        return result.map(function(v) {
            return processResult(v);
        });
    } else if (_.isObject(result)) {

        return _.object(_.map(result, function(v, k) {
            var key = k[0].toLowerCase() + k.slice(1);
            if (key === 'Items' && _.isArray(v)) {
                return processResult(v);
            }
            return [key, processResult(v)];
        }));
    } else {
        return result;
    }
};

var processOpts = function(options, defaultOpts) {

    var opts = {};

    if (!options) return opts;

    if (options.include && typeof options.include !== 'string') {
        opts.include = '[' + stringify(options.include) + ']'
    }

    if (!options.take && defaultOpts && defaultOpts.take) {
        opts.take = defaultOpts.take
    }

    return opts;
}

module.exports = {

    get: function() {

        var args = Array.prototype.slice.call(arguments);

        if (args.length === 3) {
            return request('GET', getResource(args[0]) + '/' + args[1], processOpts(args[2])).then(processResult);
        } else {
            return load(args[0], processOpts(args[1], {
                take: 1000
            })).then(processResult);
        }

    },

    remove: function(collection, id) {
        return request('DELETE', getResource(collection) + '/' + id);
    },

    create: function(collection, data) {
        return requestPost('POST', getResource(collection), data);
    },

    save: function(collection, id, data) {
        return requestPost('POST', getResource(collection) + '/' + id, data);
    }

};
