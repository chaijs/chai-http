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
var Err = chai.AssertionError;

function err(fn, msg) {
  try {
    fn();
    throw new Err({message: 'expected an error'});
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

  test('Assertion#ip', function() {
    expect('127.0.0.1').to.be.an.ip;
    expect('2001:0db8:85a3:0000:0000:8a2e:0370:7334').to.be.an.ip;

    err(function() {
      expect('127.0.0.1').not.to.be.an.ip;
    }, 'expected \'127.0.0.1\' to not be an ip');

    err(function() {
      expect('2001:0db8:85a3:0000:0000:8a2e:0370:7334').to.not.be.an.ip;
    }, 'expected \'2001:0db8:85a3:0000:0000:8a2e:0370:7334\' to not be an ip');
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

  test('Assertion#headers', function() {
    var req = {headers: {foo: 'bar'}};
    var res = {
      getHeader: function(key) {
        return 'foo';
      }
    };

    expect(req).to.have.headers;
    expect(res).to.have.headers;

    err(function() {
      expect(req).not.to.have.headers;
    }, 'expected { headers: { foo: \'bar\' } } to not have headers or getHeader method');

    err(function() {
      expect(res).not.to.have.headers;
    }, 'expected { getHeader: [Function] } to not have headers or getHeader method');
  });

  test('Assertion#json', function() {
    var req = {headers: {'content-type': ['application/json']}};
    var res = {
      getHeader: function(key) {
        return 'application/json'
      }
    };

    expect(req).to.be.json;
    expect(res).to.be.json;

    err(function() {
      expect(req).not.to.be.json;
    }, 'expected [ \'application/json\' ] to not include \'application/json\'');

    err(function() {
      expect(res).not.to.be.json;
    }, 'expected \'application/json\' to not include \'application/json\'');
  });

  test('Assertion#text', function() {
    var req = {headers: {'content-type': ['text/plain']}};
    var res = {
      getHeader: function(key) {
        return 'text/plain'
      }
    };

    expect(req).to.be.text;
    expect(res).to.be.text;

    err(function() {
      expect(req).not.to.be.text;
    }, 'expected [ \'text/plain\' ] to not include \'text/plain\'');

    err(function() {
      expect(res).not.to.be.text;
    }, 'expected \'text/plain\' to not include \'text/plain\'');
  });

  test('Assertion#html', function() {
    var req = {headers: {'content-type': ['text/html']}};
    var res = {
      getHeader: function(key) {
        return 'text/html'
      }
    };

    expect(req).to.be.html;
    expect(res).to.be.html;

    err(function() {
      expect(req).not.to.be.html;
    }, 'expected [ \'text/html\' ] to not include \'text/html\'');

    err(function() {
      expect(res).not.to.be.html;
    }, 'expected \'text/html\' to not include \'text/html\'');
  });
});
