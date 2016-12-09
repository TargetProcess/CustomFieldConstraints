const path = require('path');
const shell = require('shelljs');
const builder = require('./builder');

const buildPath = path.join(builder.mashupsPath(), shell.env.npm_package_name);

shell.rm('-rf', buildPath);
