module.exports = (process && process.env && process.env.CHAIHTTP_COV)
  ? require('./lib-cov/http')
  : require('./lib/http');
