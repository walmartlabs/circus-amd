var Handlebars = require('handlebars'),
    fs = require('fs');

var bootstrapTemplate = loadTemplate('../client/bootstrap.js.hbs');

module.exports = exports = function BootstrapPlugin() {};

exports.prototype.apply = function(compiler) {
  compiler.plugin('compilation', function(compilation) {
    compilation.mainTemplate.plugin('require-extensions', function(extensions, chunk/*, hash */) {
      if (!chunk.bootstrap && !this.outputOptions.bootstrap) {
        return extensions;
      }

      var jsonpFunction = this.outputOptions.jsonpFunction || 'zeusJsonp';

      return this.asString([
        extensions,
        bootstrapTemplate({
          jsonpFunction: JSON.stringify(jsonpFunction)
        })
      ]);
    });
  });
};

function loadTemplate(name) {
  var src = fs.readFileSync(__dirname + '/' + name).toString();
  return Handlebars.compile(src, {noEscape: true});
}
