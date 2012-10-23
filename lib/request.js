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
 * Primary export
 *
 * Given a function or http server, proceed
 * to construct a chainable request object.
 *
 * @param {Mixed} function or server
 * @returns {Object} API
 */

module.exports = function (app) {
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

/**
 * Test
 *
 * An extension of superagent.Request,
 * this provides the same chainable api
 * as superagent so all things can be modified.
 */

function Test (app, method, path) {
  this.app = app;
  this.method = method;
  this.path = path;
}

Test.prototype.req = function (cb) {
  this._req = cb;
  return this;
};

/**
 * Overwrite Request#end to provide our
 * stop and start functions for the server.
 *
 * @param {Function} callback
 * @cb {Error|null}
 * @cb {Response}
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
