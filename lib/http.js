/*!
 * chai-http
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai) {
  var Assertion = chai.Assertion
    , i = chai.inspect;

  /**
   * Return a header from `Request` or `Response` objects.
   *
   * @param {Request|Response} object
   * @param {String} Header
   * @returns {String|Undefined}
   */
  function getHeader(obj, key) {
    if (obj.getHeader) return obj.getHeader(key);
    if (obj.headers) return obj.headers[key];
  };

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

  Object.defineProperty(Assertion.prototype, 'json',
    { get: function () {
        new Assertion(this.obj).to.have.header('content-type');
        var ct = this.obj.headers['content-type'];

        this.assert(
            ~ct.indexOf('application/json')
          , 'expected ' + i(ct) + ' to include \'application/json\''
          , 'expected ' + i(ct) + ' to not include \'application/json\''
          , 'application/json'
          , ct
        );

        return this;
      }
    , configurable: true
  });

  Object.defineProperty(Assertion.prototype, 'html',
    { get: function () {
        new Assertion(this.obj).to.have.header('content-type');
        var ct = this.obj.headers['content-type'];

        this.assert(
            ~ct.indexOf('text/plain')
          , 'expected ' + i(ct) + ' to include \'text/html\''
          , 'expected ' + i(ct) + ' to not include \'text/html\''
          , 'text/html'
          , ct
        );

        return this;
      }
    , configurable: true
  });

  Object.defineProperty(Assertion.prototype, 'text',
    { get: function () {
        new Assertion(this.obj).to.have.header('content-type');
        var ct = this.obj.headers['content-type'];

        this.assert(
            ~ct.indexOf('text/plain')
          , 'expected ' + i(ct) + ' to include \'text/plain\''
          , 'expected ' + i(ct) + ' to not include \'text/plain\''
          , 'text/plain'
          , ct
        );

        return this;
      }
    , configurable: true
  });
}
