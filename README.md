
# Targetprocess Mashup Webpack Boilerplate

[Webpack](http://webpack.github.io) boilerplate to create Targetprocess mashup.

## Usage

Clone repository. 

Run `npm install`.

Edit `make-webpack-config.js` to make suitable for your needs. Edit source code in `src` folder.

Run `npm run build` or `npm run build-production`.

You can install [targetprocess-mashup-uploader](https://github.com/TargetProcess/targetprocess-mashup-uploader) to immediately upload your build to Mashup Manager

```
targetprocess-mashup-uploader --host yourhost --login admin --password admin --name MyMashup --watch dist/index.js
```

### makeWebpackConfig(options)

 - **mashupName** name of mashup
 - **production** minimize output and prevent debug tools, false by default
 - **mashupManager** optimize mashup to be one file to pasted into Mashup Manager textarea

## Main Features

* `style-loader`, `css-loader`, `babel-loader` are installed by default
* Global variable `mashup` contains config data
* Auto-generate config module from JSON file `config.json`.
* Auto-generate system configs from `manifest.json`
* Prevent chunks to be loaded automatically

## Externals

By default these modules are resolved as external

* `jQuery`
* `Underscore`
* `tau/*`
* `tp3/*`
* `tp/*`

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

