var cron = require('node-cron');

cron.schedule('1-5 1,2,4,5 * * * *', () => {
  console.log('running every minute 1, 2, 4 and 5');
});



var valid = cron.validate('59 * * * *');
var invalid = cron.validate('1-5 1,2,4,5 * * * *');

console.log(invalid)