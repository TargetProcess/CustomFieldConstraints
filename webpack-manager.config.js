const makeWebpackConfig = require('./make-webpack-config');
const buildMode = require('./webpack-build.mode');

module.exports = makeWebpackConfig({
    production: buildMode.isProduction()
});
