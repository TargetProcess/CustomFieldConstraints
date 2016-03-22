var webpack = require('webpack');

module.exports = function(config) {

    var webpackConfig = {
        devtool: '#cheap-module-inline-source-map',
        module: {
            loaders: [{
                test: /\.json$/,
                loader: 'json'
            }, {
                test: /\.css$/,
                loader: 'style!css?localIdentName=[name]-[local]'
            }],
            noParse: [
                /node_modules\/sinon\//
            ]
        },
        resolve: {
            modulesDirectories: ['node_modules', 'shared', 'conf'],
            alias: {
                sinon: 'sinon/pkg/sinon'
            }
        },
        externals: {
            jsdom: 'window',
            cheerio: 'window',
            'react-dom': 'window',
            'react-dom/server': 'window',
            'react-addons-test-utils': 'window'
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('development')
            })
        ]
    };

    if (config.reporters.indexOf('coverage') >= 0) {

        webpackConfig.module.loaders = webpackConfig.module.loaders.concat([{
            test: /__tests__\/.*?\.js$/,
            exclude: /node_modules/,
            loader: 'babel'
        }, {
            test: function(p) {

                return Boolean(p.match(/\.js$/)) && !Boolean(p.match(/__tests__\/.*?\.js$/));

            },
            exclude: /node_modules/,
            loader: 'isparta'
        }]);

    } else {

        webpackConfig.module.loaders = webpackConfig.module.loaders.concat([{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel'
        }]);

    }

    config.set({

        frameworks: [
            'mocha', 'chai', 'sinon',
            'sinon-chai'
        ],

        files: [
            './node_modules/phantomjs-polyfill/bind-polyfill.js',
            'test/bundle.js'
        ],

        preprocessors: {
            'test/bundle.js': ['webpack', 'sourcemap']
        },

        coverageReporter: {
            reporters: [
                {type: 'html'},
                {type: 'text-summary'}
            ],
            check: {
                global: {
                    statements: 50,
                    branches: 50,
                    functions: 50,
                    lines: 50
                }
            },
            watermark: {
                statements: [50, 90],
                branches: [50, 90],
                functions: [50, 90],
                lines: [50, 90]
            }
        },
        notifyReporter: {
            reportEachFailure: true,
            reportSuccess: false
        },

        webpack: webpackConfig,
        webpackServer: {
            noInfo: true
        },

        client: {
            captureConsole: true
        }

    });

};
