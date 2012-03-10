/*!
 * chai-http
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai) {

  /**
   * Aliases.
   */
  var Assertion = chai.Assertion
    , i = chai.inspect;

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
  Assertion.prototype.status = function (code) {
    new Assertion(this.obj).to.have.property('statusCode');
    var statusCode = this.obj.statusCode;

    this.assert(
        statusCode == code
      , 'expected ' + this.inspect + ' to have status code ' + code + ' but got ' + statusCode
      , 'expected ' + this.inspect + ' to not have status code ' + statusCode
      , code
      , statusCode
    );

    return this;
  };

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
  Assertion.prototype.header = function (key, value) {
    var header = getHeader(this.obj, key);

    this.assert(
        header == value
      , 'expected header ' + key + ' to have value ' + value + ' but got ' + i(header)
      , 'expected header ' + key + ' to not have value ' + value
      , value
      , header
    );

    return this;
  };

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
  Object.defineProperty(Assertion.prototype, 'headers',
    { get: function() {
        this.assert(
            this.obj.headers || this.obj.getHeader
          , 'expected ' + i(this.obj) + ' to have headers or getHeader method'
          , 'expected ' + i(this.obj) + ' to not have headers or getHeader method'
          , 'headers'
          , this.obj
        );
      }
    , configurable: true
  });

  /**
   * # .json
   * # .text
   * # .html
   *
   * Assert that a `Response` or `Request` object has a given content-type.
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
  Object.keys(contentTypes).forEach(function(name) {
    var val = contentTypes[name];

    Object.defineProperty(Assertion.prototype, name,
      { get: function () {
          new Assertion(this.obj).to.have.headers;
          var ct = getHeader(this.obj, 'content-type');

          this.assert(
              ~ct.indexOf(val)
            , 'expected ' + i(ct) + ' to include \'' + val + '\''
            , 'expected ' + i(ct) + ' to not include \'' + val + '\''
            , val
            , ct
          );

          return this;
        }
      , configurable: true
    });
  });
};
