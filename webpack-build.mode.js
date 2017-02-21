const debugArgv = () => '--debug';

const isProduction = () => process.argv.indexOf(debugArgv()) === -1;

module.exports = {
    isProduction,
    debugArgv
};
