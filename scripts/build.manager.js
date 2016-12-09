const builder = require('./builder');

const buildPath = 'build/manager';
const managerConfig = 'webpack-production.config.js';

builder.build(buildPath, managerConfig);
