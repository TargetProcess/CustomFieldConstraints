const webpack = require('webpack');

module.exports = (config) => {

    const webpackConfig = {
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
            'react/lib/ReactContext': true,
            'react/lib/ExecutionEnvironment': true
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
            test: (p) => {

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
            './node_modules/babel-polyfill/dist/polyfill.js',
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
