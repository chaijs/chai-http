/*!
 * chai-http
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * Context.
 */
var http = require('../lib/http');
var chai = require('chai');
chai.use(http);

/**
 * Support.
 */
var expect = chai.expect;

function err(fn, msg) {
  try {
    fn();
    throw new Error('expected an error');
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

  test('Assertion#header', function() {
    var req = {headers: {foo: 'bar'}};
    var res = {
      getHeader: function(key) {
        return 'foo';
      }
    };

    expect(req).to.have.header('foo', 'bar');
    expect(res).to.have.header('bar', 'foo');

    err(function() {
      expect(req).not.to.have.header('foo', 'bar');
    }, 'expected header foo to not have value bar');

    err(function() {
      expect(res).not.to.have.header('bar', 'foo');
    }, 'expected header bar to not have value foo');
  });
});
