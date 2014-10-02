/*!
 * chai-http
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ## Assertions
 *
 * The Chai HTTP module provides a number of assertions
 * for the `expect` and `should` interfaces.
 */

module.exports = function (chai, _) {

  /*!
   * Module dependencies.
   */

  var net = require('net');
  var qs = require('qs');
  var url = require('url');
  var Cookie = require('cookiejar');

  /*!
   * Aliases.
   */

  var Assertion = chai.Assertion
    , i = _.inspect;

  /*!
   * Expose request builder
   */

  chai.request = require('./request');

  /*!
   * Content types hash. Used to
   * define `Assertion` properties.
   *
   * @type {Object}
   */

  var contentTypes = {
      json: 'application/json'
    , text: 'text/plain'
    , html: 'text/html'
  };

  /*!
   * Return a header from `Request` or `Response` object.
   *
   * @param {Request|Response} object
   * @param {String} Header
   * @returns {String|Undefined}
   */

  function getHeader(obj, key) {
    if (obj.getHeader) return obj.getHeader(key);
    if (obj.headers) return obj.headers[key];
  };

  /**
   * ### .status (code)
   *
   * Assert that a response has a supplied status.
   *
   * ```js
   * expect(res).to.have.status(200);
   * ```
   *
   * @param {Number} status number
   * @name status
   * @api public
   */

  Assertion.addMethod('status', function (code) {
    new Assertion(this._obj).to.have.property('statusCode');
    var statusCode = this._obj.statusCode;

    this.assert(
        statusCode == code
      , 'expected #{this} to have status code #{exp} but got #{act}'
      , 'expected #{this} to not have status code #{act}'
      , code
      , statusCode
    );
  });

  /**
   * ### .header (key[, value])
   *
   * Assert that an object has a header. If a value is
   * provided, equality to value will be asserted.
   *
   * ```js
   * expect(req).to.have.header('x-api-key');
   * expect(req).to.have.header('content-type', 'text/plain');
   * ```
   *
   * @param {String} header key
   * @param {String} header value (optional)
   * @name header
   * @api public
   */

  Assertion.addMethod('header', function (key, value) {
    var header = getHeader(this._obj, key);

    if (arguments.length === 2) {
      this.assert(
          header == value
        , 'expected header \'' + key + '\' to have value ' + value + ' but got ' + i(header)
        , 'expected header \'' + key + '\' to not have value ' + value
        , value
        , header
      );
    } else {
      this.assert(
          'undefined' !== typeof header || null === header
        , 'expected header \'' + key + '\' to exist'
        , 'expected header \'' + key + '\' to not exist'
      );
    }
  });

  /**
   * ### .headers
   *
   * Assert that an object has headers.
   *
   * ```js
   * expect(req).to.have.headers;
   * ```
   *
   * @name headers
   * @api public
   */

  Assertion.addProperty('headers', function () {
    this.assert(
        this._obj.headers || this._obj.getHeader
      , 'expected #{this} to have headers or getHeader method'
      , 'expected #{this} to not have headers or getHeader method'
    );
  });

  /**
   * ### .ip
   *
   * Assert that a string represents valid ip address.
   *
   * ```js
   * expect('127.0.0.1').to.be.an.ip;
   * expect('2001:0db8:85a3:0000:0000:8a2e:0370:7334').to.be.an.ip;
   * ```
   *
   * @name ip
   * @api public
   */

  Assertion.addProperty('ip', function () {
    this.assert(
        net.isIP(this._obj)
      , 'expected #{this} to be an ip'
      , 'expected #{this} to not be an ip'
    );
  });

  /**
   * ### .json / .text / .html
   *
   * Assert that a `Response` or `Request` object has a given content-type.
   *
   * ```js
   * expect(req).to.be.json;
   * expect(req).to.be.html;
   * expect(req).to.be.text;
   * ```
   *
   * @name json
   * @name html
   * @name text
   * @api public
   */

  function checkContentType (name) {
    var val = contentTypes[name];

    Assertion.addProperty(name, function () {
      new Assertion(this._obj).to.have.headers;
      var ct = getHeader(this._obj, 'content-type')
        , ins = i(ct) === 'undefined'
          ? 'headers'
          : i(ct);

      this.assert(
          ct && ~ct.indexOf(val)
        , 'expected ' + ins + ' to include \'' + val + '\''
        , 'expected ' + ins + ' to not include \'' + val + '\''
      );
    });
  }

  Object
    .keys(contentTypes)
    .forEach(checkContentType);

  /**
   * ### .redirect
   *
   * Assert that a `Response` object has a redirect status code.
   *
   * ```js
   * expect(res).to.redirect;
   * ```
   *
   * @name redirect
   * @api public
   */

  Assertion.addProperty('redirect', function() {
    var redirectCodes = [301, 302, 303]
      , statusCode = this._obj.statusCode;

    this.assert(
        redirectCodes.indexOf(statusCode) >= 0
      , "expected redirect with 30{1-3} status code but got " + statusCode
      , "expected not to redirect but got " + statusCode + " status"
    );
  });

  /**
   * ### .redirectTo
   *
   * Assert that a `Response` object has a redirects to the supplied location.
   *
   * ```js
   * expect(res).to.redirectTo('http://example.com');
   * ```
   *
   * @param {String} location url
   * @name redirectTo
   * @api public
   */

  Assertion.addMethod('redirectTo', function(destination) {
    new Assertion(this._obj).to.redirect;

    var assertion = new Assertion(this._obj);
    _.transferFlags(this, assertion);
    assertion.with.header('location', destination);
  });

  /**
   * ### .param
   *
   * Assert that a `Request` object has a query string parameter with a given
   * key, (optionally) equal to value
   *
   * ```js
   * expect(req).to.have.param('orderby');
   * expect(req).to.have.param('orderby', 'date');
   * expect(req).to.not.have.param('limit');
   * ```
   *
   * @param {String} parameter name
   * @param {String} parameter value
   * @name param
   * @api public
   */

  Assertion.addMethod('param', function(name, value) {
    var assertion = new Assertion();
    _.transferFlags(this, assertion);
    assertion._obj = qs.parse(url.parse(this._obj.url).query);
    assertion.property(name, value);
  });

  /**
   * ### .cookie
   *
   * Assert that a `Request` or `Response` object has a cookie header with a
   * given key, (optionally) equal to value
   *
   * ```js
   * expect(req).to.have.cookie('session_id');
   * expect(req).to.have.cookie('session_id', '1234');
   * expect(req).to.not.have.cookie('PHPSESSID');
   * expect(res).to.have.cookie('session_id');
   * expect(res).to.have.cookie('session_id', '1234');
   * expect(res).to.not.have.cookie('PHPSESSID');
   * ```
   *
   * @param {String} parameter name
   * @param {String} parameter value
   * @name param
   * @api public
   */

  Assertion.addMethod('cookie', function (key, value) {
    var header = getHeader(this._obj, 'set-cookie')
      , cookie;

    if (!header) {
       header = getHeader(this._obj, 'cookie').split(';');
    }

    cookie = Cookie.CookieJar();
    cookie.setCookies(header);
    cookie = cookie.getCookie(key, new Cookie.CookieAccessInfo());

    if (arguments.length === 2) {
      this.assert(
          cookie.value == value
        , 'expected cookie \'' + key + '\' to have value #{exp} but got #{act}'
        , 'expected cookie \'' + key + '\' to not have value #{exp}'
        , value
        , cookie.value
      );
    } else {
      this.assert(
          'undefined' !== typeof cookie || null === cookie
        , 'expected cookie \'' + key + '\' to exist'
        , 'expected cookie \'' + key + '\' to not exist'
      );
    }
  });
};
