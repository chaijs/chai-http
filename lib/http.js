/*!
 * chai-http
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, _) {

  /**
   * Module dependencies.
   */
  var net = require('net');

  /**
   * Aliases.
   */
  var Assertion = chai.Assertion
    , i = _.inspect;

  /**
   * Content types hash. Used to
   * define `Assertion` properties.
   *
   * @type {Object}
   */
  var contentTypes = {
    json: 'application/json',
    text: 'text/plain',
    html: 'text/html'
  };

  /**
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
   * #.status
   *
   * Assert that an object has a supplied status.
   *
   *      expect(res).to.have.status(200);
   *
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
   * #.header
   *
   * Assert that an object has a header with supplied value.
   *
   *      expect(req).to.have.header('content-type', 'text/plain');
   *
   * @name header
   * @api public
   */
  Assertion.addMethod('header', function (key, value) {
    var header = getHeader(this._obj, key);

    this.assert(
        header == value
      , 'expected header ' + key + ' to have value ' + value + ' but got ' + i(header)
      , 'expected header ' + key + ' to not have value ' + value
      , value
      , header
    );
  });

  /**
   * #.headers
   *
   * Assert that an object has headers.
   *
   *      expect(req).to.have.headers;
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
   * #.ip
   *
   * Assert that a string represents valid ip address.
   *
   *      expect('127.0.0.1').to.be.an.ip;
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
   * # .json
   * # .text
   * # .html
   *
   * Assert that a `Response` or `Request` object has a given content-type.
   *
   *
   *      expect(req).to.be.json;
   *      expect(req).to.be.html;
   *      expect(req).to.be.text;
   *
   * @name json
   * @name html
   * @name text
   * @api public
   */

  Object
    .keys(contentTypes)
    .forEach(function(name) {
      var val = contentTypes[name];
      Assertion.addProperty(name, function () {
        new Assertion(this._obj).to.have.headers;
        var ct = getHeader(this._obj, 'content-type');

        this.assert(
            ~ct.indexOf(val)
          , 'expected ' + i(ct) + ' to include \'' + val + '\''
          , 'expected ' + i(ct) + ' to not include \'' + val + '\''
        );
      });
    });
};
