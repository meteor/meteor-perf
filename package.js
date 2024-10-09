Package.describe({
  name: 'meteor-perf',
  version: '0.0.1',
  summary: 'Smart performance monitoring for Meteor apps',
  git: 'https://github.com/meteor/meteor-perf.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('3.0');
  api.use(['ecmascript', 'random']);
  api.mainModule('index.js', ['server']);
});