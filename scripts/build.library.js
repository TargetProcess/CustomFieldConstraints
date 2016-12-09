const shell = require('shelljs');
const builder = require('./builder');

const buildPath = 'build/library';
const libraryConfig = 'webpack-library.config.js';

builder.build(buildPath, libraryConfig);
shell.cp('docs/README.md', `${buildPath}/README.mkd`);
shell.cp('docs/*.png', buildPath);
