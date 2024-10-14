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

Package.onTest(function(api) {
  api.use(['ecmascript', 'random', 'meteortesting:mocha', 'mongo']);

  api.use('meteor-perf');

  Npm.depends({
    'chai': '4.3.4',
    'sinon': '10.0.0',
    'sinon-chai': '3.6.0'
  });

  api.mainModule('tests/index.js', 'server');
});