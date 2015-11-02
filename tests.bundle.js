var context = require.context('./src', true, /\/__tests__\/(.+)\.js$/);

context.keys().forEach(context);
