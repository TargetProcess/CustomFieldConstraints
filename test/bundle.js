var context = require.context('./../src', true, /\/__tests__\/(.+)\.js$/);

require('./pre');
context.keys().forEach(context);

// var f = require('./../src/screens/Form/components/__tests__/Form')
// var f = require('./../src/screens/Form/components/__tests__/e');
