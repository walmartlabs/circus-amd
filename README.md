# circus-amd

Allows existing AMD projects to import Circus components at runtime.

## Usage

Used as a preprocessor for the `Circus.config` method:

```javascript
var Circus = require('circus'),
    CircusAMD = require('circus-amd');

var config = {};
config = CircusAMD.config(config);
config = Circus.config(config);
```

This configuration will include the necessary AMD registration in the bootstrap method. This can then be include in the AMD build via path generation util.

It's generally recommended that the resulting bootstrap file be bundled into the including project, but it's possible to publish the bootstrap file to a HTTP endpoint and load it separately.

When an entry point is omitted from the config, a simple bootstrap will be created that exports all Circus components installed in the project.


## Path Generation

The `amdPaths(config[, bootstrap])` method is exposed in order to generate the paths config necessary to register the modules included in the Circus project with AMD's resolution system.

- `config`: webpack configuration used to build the current project.
- `bootstrap`: Path to the bootstrap location, per AMD resolution rules. Defaults to `"bootstrap"` but may be set to `"empty:"` or any other value needed by the AMD environment.

Returns a hash of AMD module names mapping to whatever bootstrap may be.
