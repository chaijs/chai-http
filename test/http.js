/*!
 * chai-http
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * Context.
 */
var http = require('../lib/http');
var chai = require('chai').use(http);

/**
 * Support.
 */
var expect = chai.expect;

function err(fn, msg) {
  try {
    fn();
    chai.fail('expected an error');
  } catch (err) {
    expect(msg).to.equal(err.message);
  }
}

suite('chai-http', function() {
  test('Assertion#status', function() {
    var res = {statusCode: 200};

    expect(res).to.have.status(200);

    err(function() {
      expect(res).not.to.have.status(200);
    }, 'expected { statusCode: 200 } to not have status code 200');

    err(function() {
      expect({}).not.to.have.status(200);
    }, "expected {} to have a property 'statusCode'");
  });
});
