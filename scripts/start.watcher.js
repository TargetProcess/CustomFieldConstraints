const path = require('path');
const shell = require('shelljs');
const builder = require('./builder');
const buildMode = require('../webpack-build.mode');

const buildPath = path.join(builder.mashupsPath(), shell.env.npm_package_name);
const port = 8089;
const watchConfig = 'webpack-library.config.js';
const mode = buildMode.debugArgv();

builder.watch(buildPath, port, watchConfig, mode);
