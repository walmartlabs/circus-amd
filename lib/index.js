var _ = require('lodash'),
    BootstrapPlugin = require('./plugins/bootstrap');

module.exports.config = function(config) {
  if (Array.isArray(config)) {
    return _.map(config, module.exports.config);
  } else {
    return _.defaults({
      plugins: plugins(config.plugins)
    }, config);
  }
};

function plugins(additions) {
  var base = [
    new BootstrapPlugin()
  ];

  return additions ? base.concat(additions) : base;
}

/**
 * Outputs the path mappings necessary for AMD modules to load Circus components.
 */
module.exports.amdPaths = function(config, bootstrap) {
  bootstrap = bootstrap || 'bootstrap';

  var ret = {};

  _.each(config.components, function(component, componentName) {
    ret[componentName] = bootstrap;

    _.each(component.modules, function(module) {
      ret[module.name] = bootstrap;
    });
  });

  return ret;
};
