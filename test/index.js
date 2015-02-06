var Circus = require('circus'),
    CircusAMD = require('../lib'),
    Path = require('path'),
    webpack = require('webpack');

var childProcess = require('child_process'),
    expect = require('chai').expect,
    fs = require('fs'),
    temp = require('temp'),
    phantom = require('phantomjs');

describe('loader integration', function() {
  var outputDir;

  beforeEach(function(done) {
    temp.mkdir('loader-plugin', function(err, dirPath) {
      if (err) {
        throw err;
      }

      outputDir = dirPath;

      var runner = fs.readFileSync(__dirname + '/client/runner.js');
      fs.writeFileSync(outputDir + '/runner.js', runner);

      var html = fs.readFileSync(__dirname + '/client/initial-route.html');
      fs.writeFileSync(outputDir + '/index.html', html);

    var require = fs.readFileSync(__dirname + '/client/require.js');
    fs.writeFileSync(outputDir + '/require.js', require);

    var exec = fs.readFileSync(__dirname + '/fixtures/amd-exec.js');
    fs.writeFileSync(outputDir + '/exec.js', exec);

      done();
    });
  });
  afterEach(function() {
    temp.cleanupSync();
  });

  describe('config', function() {
    it('should handle arrays', function() {
      var config = [{plugins: [1]}, {plugins: 2}, {}],
          result = CircusAMD.config(config);

      expect(result.length).to.equal(3);
      expect(result[0].plugins[1]).to.equal(1);
      expect(result[1].plugins[1]).to.equal(2);
      expect(result[2].plugins.length).to.equal(1);
    });
  });

  it('should create glue boilerplate', function(done) {
    var vendorEntry = Path.resolve(__dirname + '/fixtures/require-packages.js');

    var html = fs.readFileSync(__dirname + '/client/require.html');
    fs.writeFileSync(outputDir + '/index.html', html);

    var config = Circus.config({
      entry: vendorEntry,
      output: {
        component: 'vendor',

        path: outputDir + '/vendor',
        filename: 'vendor.js'
      }
    });

    webpack(config, function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors).to.be.empty;
      expect(status.compilation.warnings).to.be.empty;

      config = Circus.config({
        output: {
          path: outputDir
        },

        resolve: {
          modulesDirectories: [
            outputDir
          ]
        }
      });
      config = CircusAMD.config(config);

      webpack(config, function(err, status) {
        expect(err).to.not.exist;
        expect(status.compilation.errors).to.be.empty;
        expect(status.compilation.warnings).to.be.empty;

        runPhantom(function(err, loaded) {
          expect(loaded.scripts.length).to.equal(5);
          expect(loaded.scripts[0]).to.match(/bootstrap.js$/);
          expect(loaded.scripts[1]).to.match(/vendor.js$/);
          expect(loaded.scripts[2]).to.match(/1\.vendor.js$/);
          expect(loaded.scripts[3]).to.match(/require.js$/);
          expect(loaded.scripts[4]).to.match(/exec.js$/);

          expect(loaded.log).to.eql([
            '_: true Handlebars: true',
            'App: _: true Handlebars: true Vendor: true'
          ]);

          done();
        });
      });
    });
  });

  it('should expose externals to amd', function(done) {
    var vendorEntry = Path.resolve(__dirname + '/fixtures/require-packages.js');

    var html = fs.readFileSync(__dirname + '/client/require.html');
    fs.writeFileSync(outputDir + '/index.html', html);

    var config = Circus.config({
      entry: vendorEntry,
      output: {
        component: 'vendor',

        path: outputDir,
        filename: 'vendor.js'
      }
    });
    config = CircusAMD.config(config);

    webpack(config, function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors).to.be.empty;
      expect(status.compilation.warnings).to.be.empty;

      runPhantom(function(err, loaded) {
        expect(loaded.scripts.length).to.equal(5);
        expect(loaded.scripts[0]).to.match(/bootstrap.js$/);
        expect(loaded.scripts[1]).to.match(/vendor.js$/);
        expect(loaded.scripts[2]).to.match(/1\.vendor.js$/);
        expect(loaded.scripts[3]).to.match(/require.js$/);
        expect(loaded.scripts[4]).to.match(/exec.js$/);

        expect(loaded.log).to.eql([
          '_: true Handlebars: true',
          'App: _: true Handlebars: true Vendor: true'
        ]);

        done();
      });
    });
  });

  it('should generate amd path config', function(done) {
    var vendorEntry = Path.resolve(__dirname + '/fixtures/require-packages.js');

    webpack(Circus.config({
      context: Path.resolve(__dirname + '/fixtures'),
      entry: vendorEntry,
      output: {
        component: 'vendor',
        hideInternals: /webpack/,

        libraryTarget: 'umd',
        library: 'Circus',

        path: outputDir + '/vendor',
        filename: 'vendor.js',
        chunkFilename: '[hash:3].[id].vendor.js'
      }
    }), function(err, status) {
      expect(err).to.not.exist;
      expect(status.compilation.errors).to.be.empty;
      expect(status.compilation.warnings).to.be.empty;

      var config = Circus.config({
        resolve: {
          modulesDirectories: [
            outputDir
          ]
        }
      });
      expect(CircusAMD.amdPaths(config)).to.eql({
        'lodash': 'bootstrap',
        'handlebars/dist/cjs/handlebars.runtime': 'bootstrap',
        'handlebars/dist/cjs/handlebars/base': 'bootstrap',
        'handlebars/dist/cjs/handlebars/exception': 'bootstrap',
        'handlebars/dist/cjs/handlebars/runtime': 'bootstrap',
        'handlebars/dist/cjs/handlebars/safe-string': 'bootstrap',
        'handlebars/dist/cjs/handlebars/utils': 'bootstrap',
        'handlebars/runtime': 'bootstrap',

        'vendor': 'bootstrap',
        'vendor/packages': 'bootstrap',
        'vendor/require-packages': 'bootstrap'
      });

      expect(CircusAMD.amdPaths(config, 'empty:')).to.eql({
        'lodash': 'empty:',
        'handlebars/dist/cjs/handlebars.runtime': 'empty:',
        'handlebars/dist/cjs/handlebars/base': 'empty:',
        'handlebars/dist/cjs/handlebars/exception': 'empty:',
        'handlebars/dist/cjs/handlebars/runtime': 'empty:',
        'handlebars/dist/cjs/handlebars/safe-string': 'empty:',
        'handlebars/dist/cjs/handlebars/utils': 'empty:',
        'handlebars/runtime': 'empty:',

        'vendor': 'empty:',
        'vendor/packages': 'empty:',
        'vendor/require-packages': 'empty:'
      });

      done();
    });
  });

  function runPhantom(callback) {
    childProcess.execFile(phantom.path, [outputDir + '/runner.js', outputDir], function(err, stdout, stderr) {
      if (err) {
        throw new Error('Phantom failed code: ' + err.code + '\n\n' + stdout + '\n\n' + stderr);
      }
      expect(stderr).to.equal('');

      var loaded = JSON.parse(stdout);

      callback(undefined, loaded);
    });
  }
});
