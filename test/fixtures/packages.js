var _ = require('lodash'),
    Handlebars = require('handlebars/runtime');

var log = document.createElement('log');
log.info = '_: ' + (!!_) + ' Handlebars: ' + (!!Handlebars);
document.body.appendChild(log);

console.log('DONE');
