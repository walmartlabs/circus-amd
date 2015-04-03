var log = document.createElement('log');
log.info = 'circus module dependency should be first';
document.body.appendChild(log);

require.ensure('./packages', function() {
  require('./packages');
});
