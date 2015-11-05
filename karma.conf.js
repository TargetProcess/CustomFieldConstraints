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
            }]
        },
        resolve: {
            modulesDirectories: ['node_modules', 'shared', 'conf']
        }
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

        frameworks: ['chai', 'mocha', 'sinon', 'sinon-chai'],

        files: [
            './node_modules/phantomjs-polyfill/bind-polyfill.js',
            'tests.bundle.js'
        ],

        preprocessors: {
            'tests.bundle.js': ['webpack', 'sourcemap']
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
