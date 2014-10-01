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
    obj[method] = function (path) {
      return new Test(server, method, path);
    };
  });
  obj.del = obj.delete;

  return obj;
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
