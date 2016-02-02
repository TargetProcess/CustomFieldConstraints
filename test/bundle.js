var context = require.context('./../src', true, /\/__tests__\/(.+)\.js$/);

require('./pre');
context.keys().forEach(context);
