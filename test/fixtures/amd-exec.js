require.config({
  paths: {
    'lodash': 'bootstrap',
    'handlebars/runtime': 'bootstrap',
    'vendor': 'bootstrap',

    'chunk_vendor0': 'bootstrap',
    'chunk_vendor1': 'bootstrap'
  }
});

require(['lodash', 'handlebars/runtime', 'vendor'], function(_, Handlebars, Vendor) {
  var log = document.createElement('log');
  log.info = 'App: _: ' + (!!_) + ' Handlebars: ' + (!!Handlebars) + ' Vendor: ' + (!!Vendor);
  document.body.appendChild(log);

  console.log('DONE');
});
