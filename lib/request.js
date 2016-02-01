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
 * Chai HTTP provides an interface for live integration
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
 * __Note:__ This feature is only supported on Node.js, not in web browsers.
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
 *
 * #### Setting up requests
 *
 * Once a request is created with a given VERB, it can have headers, form data,
 * json, or even file attachments added to it, all with a simple API:
 *
 * ```js
 * // Send some JSON
 * chai.request(app)
 *   .put('/user/me')
 *   .set('X-API-Key', 'foobar')
 *   .send({ passsword: '123', confirmPassword: '123' })
 * ```
 *
 * ```js
 * // Send some Form Data
 * chai.request(app)
 *   .post('/user/me')
 *   .field('_method', 'put')
 *   .field('password', '123')
 *   .field('confirmPassword', '123')
 * ```
 *
 * ```js
 * // Attach a file
 * chai.request(app)
 *   .post('/user/avatar')
 *   .attach('imageField', fs.readFileSync('avatar.png'), 'avatar.png')
 * ```
 *
 * ```js
 * // Authenticate with Basic authentication
 * chai.request(app)
 *   .get('/protected')
 *   .auth('user', 'pass')
 * ```
 *
 * ```js
 * // Chain some GET query parameters
 * chai.request(app)
 *   .get('/search')
 *   .query({name: 'foo', limit: 10}) // /search?name=foo&limit=10
 * ```
 *
 * #### Dealing with the response - traditional
 *
 * To make the request and assert on its response, the `end` method can be used:
 *
 * ```js
 * chai.request(app)
 *   .put('/user/me')
 *   .send({ passsword: '123', confirmPassword: '123' })
 *   .end(function (err, res) {
 *      expect(err).to.be.null;
 *      expect(res).to.have.status(200);
 *   });
 * ```
 *
 * #### Dealing with the response - Promises
 *
 * If `Promise` is available, `request()` becomes a Promise capable library -
 * and chaining of `then`s becomes possible:
 *
 * ```js
 * chai.request(app)
 *   .put('/user/me')
 *   .send({ passsword: '123', confirmPassword: '123' })
 *   .then(function (res) {
 *      expect(res).to.have.status(200);
 *   })
 *   .catch(function (err) {
 *      throw err;
 *   })
 * ```
 *
 * __Note:__ Node.js version 0.10.x and some older web browsers do not have
 * native promise support. You can use any promise library, such as
 * [es6-promise](https://github.com/jakearchibald/es6-promise) or
 * [kriskowal/q](https://github.com/kriskowal/q) and call the `addPromise`
 * method to use that library with Chai HTTP. For example:
 *
 * ```js
 * var chai = require('chai');
 * chai.use(require('chai-http'));
 *
 * // Add promise support if this does not exist natively.
 * if (!global.Promise) {
 *   var q = require('q');
 *   chai.request.addPromises(q.Promise);
 * }
 * ```
 *
 * #### Retaining cookies with each request
 *
 * Sometimes you need to keep cookies from one request, and send them with the
 * next. For this, `.request.agent()` is available:
 *
 * ```js
 * // Log in
 * var agent = chai.request.agent(app)
 * agent
 *   .post('/session')
 *   .send({ username: 'me', password: '123' })
 *   .then(function (res) {
 *     expect(res).to.have.cookie('sessionid');
 *     // The `agent` now has the sessionid cookie saved, and will send it
 *     // back to the server in the next request:
 *     return agent.get('/user/me')
 *       .then(function (res) {
 *          expect(res).to.have.status(200);
 *       })
 *   })
 * ```
 *
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
module.exports.Request = Test;
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
  // If address is "unroutable" IPv4/6 address, then set to localhost
  if (addr.address === '0.0.0.0' || addr.address === '::') {
    addr.address = '127.0.0.1';
  }
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
  (Agent || Request).call(this);
  this.app = app;
}
util.inherits(TestAgent, Agent || Request);

// override HTTP verb methods
methods.forEach(function(method){
  TestAgent.prototype[method] = function(url){
    var req = new Test(this.app, method, url)
      , self = this;

    if (Agent) {
      // When running in Node, cookies are managed via
      // `Agent.saveCookies()` and `Agent.attachCookies()`.
      req.on('response', function (res) { self.saveCookies(res); });
      req.on('redirect', function (res) { self.saveCookies(res); });
      req.on('redirect', function () { self.attachCookies(req); });
      this.attachCookies(req);
    }
    else {
      // When running in a web browser, cookies are managed via `Request.withCredentials()`.
      // The browser will attach cookies based on same-origin policy.
      // https://tools.ietf.org/html/rfc6454#section-3
      req.withCredentials();
    }

    return req;
  };
});

TestAgent.prototype.del = TestAgent.prototype.delete;
