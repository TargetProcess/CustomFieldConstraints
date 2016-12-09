const path = require('path');
const webpack = require('webpack');

const pkg = require('./package.json');

const TargetprocessMashupPlugin = require('targetprocess-mashup-webpack-plugin');
const CombineAssetsPlugin = require('combine-assets-plugin');

const makeWebpackConfig = (opts_) => {

    const opts = opts_ || {};

    // mashup unique name
    opts.mashupName = opts.mashupName || __dirname.split(path.sep).pop();

    // minimize output and prevent dev tools
    opts.production = opts.hasOwnProperty('production') ? opts.production : false;

    // will mashup be used by paste to mashup manager or as bunch of files by library
    opts.mashupManager = opts.hasOwnProperty('mashupManager') ? opts.mashupManager : true;

    const mashupName = opts.mashupName;

    // you should use format <something>.config.js to allow Mashup Manager autodiscover
    // config file
    const outputConfigFileName = './mashup.config.js';

    const config = {};

    config.entry = {
        // process config js module from JSON file
        configData: [`targetprocess-mashup-config?libraryTarget=${mashupName}&parse=false&outputFile=${outputConfigFileName}!./src/config.json`],
        // main entry point
        index: [
            './src/index.js',

            'react',
            'tau/configurator',
            'tau/utils/utils.date',
            'tau/components/component.container',

            'tau/components/component.creator',
            'tau/service.container',
            'tau/services/service.navigator',
            'tau/services/service.applicationContext',
            'tau/components/component.application.generic',
            'tau/ui/extensions/application.generic/ui.extension.application.generic.placeholder',
            'tau/components/component.page.base',
            'tau/core/class',
            'tau/core/extension.base',
            'tau/core/bus.reg',
            'tp3/mashups/storage',
            'tau/core/templates-factory',
            'tau/core/view-base',
            'tau/services/service.customFields.cached',
            'tau/libs/store2/store2'
        ]
    };

    if (!opts.mashupManager) {

        // produce system configs from JSON file
        config.entry.manifestData = ['targetprocess-mashup-manifest!./src/manifest.json'];
        // prevent automatically load data from `chunks` folder, use for async load by demand
        config.entry.ignoreData = ['file?name=chunks/mashup.ignore!./src/mashup.ignore'];

    }

    config.output = {
        filename: '[name].js',
        path: 'dist',
        chunkFilename: 'chunks/[id].[name].[hash].js',
        pathinfo: !opts.production,
        // should be unique to prevent collision with main webpack instance
        jsonpFunction: `webpackJsonp_mashup_${mashupName}`
    };

    config.module = {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            loader: 'style!css'
        }]
    };

    if (!opts.production) {

        config.debug = true;
        config.devtool = 'eval-source-map';

    }

    config.resolve = {
        modulesDirectories: ['node_modules', 'shared']
    };

    config.plugins = [
        new TargetprocessMashupPlugin(mashupName, {
            useConfig: true
        }),
        new webpack.DefinePlugin({
            __DEV__: !opts.production,
            'process.env.NODE_ENV': opts.production ? '"production"' : '"development"'
        }),
        new webpack.BannerPlugin(`v${pkg.version} Build ${String(new Date())}`, {
            entryOnly: true
        })
    ];

    let toConcat = {};
    let toExclude = [
        'configData.js',
        'ignoreData.js',
        'manifestData.js'
    ];

    if (opts.mashupManager) {

        toConcat = {
            'index.js': [outputConfigFileName, 'index.js']
        };
        toExclude = toExclude.concat(outputConfigFileName);

    }

    config.plugins = config.plugins.concat(new CombineAssetsPlugin({
        toConcat: toConcat,
        toExclude: toExclude
    }));

    if (opts.mashupManager) {

        // produce single file index.js despite async chunks
        config.plugins = config.plugins.concat(new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }));

    }

    if (opts.production) {

        config.plugins = config.plugins.concat(new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }));

    }

    config.externals = [{
        jquery: 'jQuery',
        underscore: 'Underscore'
    }, 'jQuery', 'Underscore', /^tp3\//, /^tau\//, /^tp\//];

    return config;

};

module.exports = makeWebpackConfig;
