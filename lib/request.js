/*!
 * chai-http - request helper
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var harbor = require('harbor')()
  , http = require('http')
  , https = require('https')
  , methods = require('methods')
  , superagent = require('superagent')
    , Request = superagent.Request
  , util = require('util')
  , uuid = require('pauli').uuid;

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
 * to listen on for tha given test.
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
    var name = 'delete' === method
      ? 'del'
      : method;

    obj[name] = function (path) {
      return new Test(server, method, path);
    };
  });

  return obj;
}

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
  this.app = app;
  this.method = method;
  this.path = path;
}

/**
 * ### .req (cb)
 *
 * You may optionally use `.req` chainable to hook
 * into the the request preperation invocation. Use
 * this to modify the request object to include post
 * or querystring parameters, attach a file for
 * upload, or any other operation that superagent
 * provides.
 *
 * ```js
 * chai.request(app)
 *   .get('/')
 *   .req(function (req) {
 *     req.set('x-api-key', 'abc123');
 *   })
 * ```
 *
 * @param {Function} callback
 * @cb {Request} object
 * @cb {Function} next (optional)
 * @returns {this} for chaining
 * @name req
 * @api public
 */

Test.prototype.req = function (cb) {
  this._req = cb;
  return this;
};

/**
 * ### .res (cb)
 *
 * Invoke the request to to the server. The response
 * will be passed as a paramter to this function so
 * that further testing may be done. Use the `chai-http`
 * assertions for testing.
 *
 * ```js
 * chai.request(app)
 *   .get('/')
 *   .res(function (res) {
 *     expect(res).to.have.status(200);
 *   });
 * ```
 *
 * @param {Function} callback
 * @cb {Response}
 * @name res
 * @api public
 */

Test.prototype.res = function (cb) {
  var self = this
    , app = this.app
    , method = this.method
    , path = this.path;

  serverAddress.call(this, app, path, function (err, url) {
    var before = self._req
      , req = new Request(method, url)

    function makeRequest (err) {
      if (err) throw err;
      req.end(function (res) {
        cb(res);
        if (self._pid) {
          app.close();
          harbor.release(self._pid);
        }
      });
    }

    if (before && before.length === 2) {
      before(req, makeRequest);
    } else if (before) {
      before(req);
      makeRequest();
    } else {
      makeRequest();
    }
  });
};

function serverAddress (app, path, cb) {
  if ('string' === typeof app) {
    return cb(null, app + path);
  }

  var addr = app.address();

  function buildPath (port) {
    var proto = (app instanceof https.Server) ? 'https' : 'http';
    cb(null, proto + '://127.0.0.1:' + port + path);
  }

  if (!addr) {
    this._pid = uuid();
    harbor.claim(this._pid, function (err, port) {
      if (err) return cb(err);
      app.listen(port, function () {
        buildPath(port);
      });
    });
  } else {
    buildPath(addr.port);
  }
}
