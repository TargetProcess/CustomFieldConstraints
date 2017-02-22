/* eslint "padded-blocks": [0, "always"] */
const shell = require('shelljs');

const mashupsPath = () => {
    const mashupsPathEnvVariable = 'TARGETPROCESS_MASHUPS_PATH';
    const mashupsPathVariable = shell.env[mashupsPathEnvVariable];

    if (!mashupsPathVariable) {
        throw new Error(`Set ${mashupsPathEnvVariable} env variable to the TargetProcess mashups directory path ` +
                        '(usually /Code/Main/Tp.Web/JavaScript/Mashups/Common).');
    }

    return mashupsPathVariable;
};

const build = (path, config) => {
    shell.rm('-rf', path);
    shell.exec(`webpack --progress --colors --output-path ${path} --config ${config}`);
};

const watch = (path, port, config, mode) => {
    shell.rm('-rf', path);
    shell.exec('cross-env NODE_ENV=development ' +
               `webpack --progress --colors --config ${config} --watch --port ${port} --output-path ${path} ${mode}`);
};

module.exports = {
    build,
    mashupsPath,
    watch
};
