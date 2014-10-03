/*!
 * chai-http - request helper
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var http = require('http')
  , https = require('https')
  , methods = require('methods')
  , superagent = require('superagent')
  , Agent = superagent.agent
  , Request = superagent.Request
  , util = require('util');

/**
 * ## Integration Testing
 *
 * Chai HTTP provides and interface for live integration
 * testing via [superagent](https://github.com/visionmedia/superagent).
 * To do this, you must first
 * construct a request to an application or url.
 *
 * Upon construction you are provided a chainable api that
 * allow to you specify the http VERB request (get, post, etc)
 * that you wish to invoke.
 *
 * #### Application / Server
 *
 * You may use a function (such as an express or connect app)
 * or a node.js http(s) server as the foundation for your request.
 * If the server is not running, chai-http will find a suitable
 * port to listen on for a given test.
 *
 * ```js
 * chai.request(app)
 *   .get('/')
 * ```
 *
 * #### URL
 *
 * You may also use a base url as the foundation of your request.
 *
 * ```js
 * chai.request('http://localhost:8080')
 *   .get('/')
 * ```
 */

module.exports = function (app) {

  /*!
   * @param {Mixed} function or server
   * @returns {Object} API
   */

  var server = ('function' === typeof app)
      ? http.createServer(app)
      : app
    , obj = {};

  methods.forEach(function (method) {
    obj[method] = function (path) {
      return new Test(server, method, path);
    };
  });
  obj.del = obj.delete;

  return obj;
};

module.exports.Test = Test;
module.exports.agent = TestAgent;
module.exports.addPromises = function (Promise) {
  Test.Promise = Promise;
};

/*!
 * Test
 *
 * An extension of superagent.Request,
 * this provides the same chainable api
 * as superagent so all things can be modified.
 *
 * @param {Object|String} server, app, or url
 * @param {String} method
 * @param {String} path
 * @api private
 */

function Test (app, method, path) {
  Request.call(this, method, path);
  this.app = app;
  this.url = typeof app === 'string' ? app + path : serverAddress(app, path);
}
util.inherits(Test, Request);
Test.Promise = global.Promise;

/**
 * ### .then (resolveCb, rejectCb)
 *
 * Invoke the request to to the server. The response
 * will be passed as a parameter to the resolveCb,
 * while any errors will be passed to rejectCb.
 *
 * ```js
 * chai.request(app)
 *   .get('/')
 *   .then(function (res) {
 *     expect(res).to.have.status(200);
 *   }, function (err) {
 *      throw err;
 *   });
 * ```
 *
 * @param {Function} resolveCB
 * @cb {Response}
 * @param {Function} rejectCB
 * @cb {Error}
 * @name then
 * @api public
 */

Test.prototype.then = function (onResolve, onReject) {
  if (!Test.Promise) {
    throw new Error('Tried to use chai-http with promises, but no Promise library set');
  }
  if (!this._promise) {
    var self = this;
    this._promise = new Test.Promise(function (resolve, reject) {
      self.end(function (err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
  this._promise = this._promise.then(onResolve, onReject);
  return this;
};

/**
 * ### .catch (rejectCb)
 *
 * Invoke the request to to the server, catching any
 * errors with this callback. Behaves the same as
 * Promises.
 *
 * ```js
 * chai.request(app)
 *   .get('/')
 *   .catch(function (err) {
 *     throw err;
 *   });
 * ```
 *
 * @param {Function} rejectCB
 * @cb {Error}
 * @name catch
 * @api public
 */

Test.prototype.catch = function (reject) {
    return this.then(undefined, reject);
};

function serverAddress (app, path) {
  if ('string' === typeof app) {
    return app + path;
  }
  var addr = app.address();
  if (!addr) {
    app.listen(0);
    addr = app.address();
  }
  var protocol = (app instanceof https.Server) ? 'https' : 'http';
  return protocol + '://' + addr.address + ':' + addr.port + path;
}


/*!
 * agent
 *
 * Follows the same API as superagent.Request,
 * but allows persisting of cookies between requests.
 *
 * @param {Object|String} server, app, or url
 * @param {String} method
 * @param {String} path
 * @api private
 */

function TestAgent(app) {
  if (!(this instanceof TestAgent)) return new TestAgent(app);
  if (typeof app === 'function') app = http.createServer(app);
  Agent.call(this);
  this.app = app;
}
util.inherits(TestAgent, Agent);

// override HTTP verb methods
methods.forEach(function(method){
  TestAgent.prototype[method] = function(url){
    var req = new Test(this.app, method, url)
      , self = this;

    req.on('response', function (res) { self.saveCookies(res); });
    req.on('redirect', function (res) { self.saveCookies(res); });
    req.on('redirect', function () { self.attachCookies(req); });
    this.attachCookies(req);

    return req;
  };
});

TestAgent.prototype.del = TestAgent.prototype.delete;
