const path = require('path');
const shell = require('shelljs');
const builder = require('./builder');

const buildPath = path.join(builder.mashupsPath(), shell.env.npm_package_name);
const port = process.argv[1] || 8089;
const watchConfig = 'webpack-library.config.js';

builder.watch(buildPath, port, watchConfig);
