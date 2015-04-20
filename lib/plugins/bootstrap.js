var Handlebars = require('handlebars'),
    fs = require('fs'),
    Path = require('path');

var bootstrapTemplate = loadTemplate('../client/bootstrap.js.hbs');

module.exports = exports = function BootstrapPlugin() {};

exports.prototype.apply = function(compiler) {
  compiler.plugin('compilation', function(compilation) {
    compilation.mainTemplate.plugin('require-extensions', function(extensions, chunk/*, hash */) {
      if (!chunk.bootstrap && !this.outputOptions.bootstrap) {
        return extensions;
      }

      return this.asString([
        extensions,
        bootstrapTemplate({})
      ]);
    });
  });
};

function loadTemplate(name) {
  var src = fs.readFileSync(Path.join(__dirname, name)).toString();
  return Handlebars.compile(src, {noEscape: true});
}
