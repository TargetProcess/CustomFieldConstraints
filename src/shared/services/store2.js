/* eslint-disable */
var $ = require('jquery');
var _ = require('underscore');

var configurator = require('tau/configurator');

var types = configurator.getStore().getTypes().getDictionary();
var appPath = configurator.getApplicationPath();

var getResource = function(typeName) {
    return types[typeName.toLowerCase()].resource;
};

var request = function(type, path, params) {

    return $.ajax({
        type: type,
        url: appPath + '/api/v2/' + path,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: params
    });

};

var load = function(resource, params) {

    var loadPages = function loadPages(url, params) {

        return request('get', url, params)
            .then(function(res) {
                return res.items;
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

var processOpts = function(options) {

    return options;
};

module.exports = {

    get: function() {

        var args = Array.prototype.slice.call(arguments);

        if (args.length === 3) {
            return request('GET', getResource(args[0]) + '/' + args[1], processOpts(args[2])).then(processResult);
        } else {
            return load(args[0], processOpts(args[1])).then(processResult);
        }

    }

};
