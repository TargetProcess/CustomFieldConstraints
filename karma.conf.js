var webpack = require('webpack');

module.exports = function(config) {

    config.set({

        browsers: ['PhantomJS'],
        // browsers: ['Chrome'],

        frameworks: ['chai', 'mocha'
            // , 'sinon', 'sinon-chai'
            ],

        files: [
            // './node_modules/phantomjs-polyfill/bind-polyfill.js',
            'tests.bundle.js'
        ],

        preprocessors: {
            'tests.bundle.js': ['webpack', 'sourcemap']
        },

        reporters: ['spec'],

        webpack: {
            // devtool: '@inline-source-map',
            devtool: '#cheap-module-inline-source-map',
            module: {
                loaders: [{
                    test: /\.js$/,
                    loader: 'babel-loader?{"ignore":["node_modules/"]}'
                }, {
                    test: /\.json$/,
                    loader: 'json'
                }, {
                    test: /\.css$/,
                    loader: 'null'
                }, {
                    test: /\.scss$/,
                    loader: 'null'
                }]
            },
            resolve: {
                modulesDirectories: ['node_modules', 'shared', 'conf']
            },
            plugins: [
                new webpack.DefinePlugin({
                    __FEATURES__: {
                        sendStatistics: true
                    }
                })
            ]

        },

        client: {
            captureConsole: true
        },

        webpackServer: {
            noInfo: true
        }

    });

};
