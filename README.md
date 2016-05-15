# Chai HTTP [![Build Status](https://travis-ci.org/chaijs/chai-http.svg?branch=master)](https://travis-ci.org/chaijs/chai-http)

> HTTP integration testing with Chai assertions.

#### Features

- integration test request composition
- test http apps or external services
- assertions for common http tasks
- chai `expect` and `should` interfaces

#### Installation

This is a addon plugin for the [Chai Assertion Library](http://chaijs.com). Install via [npm](http://npmjs.org).

    npm install chai-http

#### Plugin

Use this plugin as you would all other Chai plugins.

```js
var chai = require('chai')
  , chaiHttp = require('chai-http');

chai.use(chaiHttp);
```

To use Chai HTTP on a web page, just include the [`dist/chai-http.js`](dist/chai-http.js) file:

```html
<script src="chai.js"></script>
<script src="chai-http.js"></script>
<script>
  chai.use(chaiHttp);
</script>
```

## Integration Testing

Chai HTTP provides an interface for live integration
testing via [superagent](https://github.com/visionmedia/superagent).
To do this, you must first
construct a request to an application or url.

Upon construction you are provided a chainable api that
allow to you specify the http VERB request (get, post, etc)
that you wish to invoke.

#### Application / Server

You may use a function (such as an express or connect app)
or a node.js http(s) server as the foundation for your request.
If the server is not running, chai-http will find a suitable
port to listen on for a given test.

__Note:__ This feature is only supported on Node.js, not in web browsers.

```js
chai.request(app)
  .get('/')
```

#### URL

You may also use a base url as the foundation of your request.

```js
chai.request('http://localhost:8080')
  .get('/')
```

#### Setting up requests

Once a request is created with a given VERB, it can have headers, form data,
json, or even file attachments added to it, all with a simple API:

```js
// Send some JSON
chai.request(app)
  .put('/user/me')
  .set('X-API-Key', 'foobar')
  .send({ passsword: '123', confirmPassword: '123' })
```

```js
// Send some Form Data
chai.request(app)
  .post('/user/me')
  .field('_method', 'put')
  .field('password', '123')
  .field('confirmPassword', '123')
```

```js
// Attach a file
chai.request(app)
  .post('/user/avatar')
  .attach('imageField', fs.readFileSync('avatar.png'), 'avatar.png')
```

```js
// Authenticate with Basic authentication
chai.request(app)
  .get('/protected')
  .auth('user', 'pass')
```

```js
// Chain some GET query parameters
chai.request(app)
  .get('/search')
  .query({name: 'foo', limit: 10}) // /search?name=foo&limit=10
```

#### Dealing with the response - traditional

To make the request and assert on its response, the `end` method can be used:

```js
chai.request(app)
  .put('/user/me')
  .send({ passsword: '123', confirmPassword: '123' })
  .end(function (err, res) {
     expect(err).to.be.null;
     expect(res).to.have.status(200);
  });
```

#### Dealing with the response - Promises

If `Promise` is available, `request()` becomes a Promise capable library -
and chaining of `then`s becomes possible:

```js
chai.request(app)
  .put('/user/me')
  .send({ passsword: '123', confirmPassword: '123' })
  .then(function (res) {
     expect(res).to.have.status(200);
  })
  .catch(function (err) {
     throw err;
  })
```

__Note:__ Node.js version 0.10.x and some older web browsers do not have
native promise support. You can use any promise library, such as
[es6-promise](https://github.com/jakearchibald/es6-promise) or
[kriskowal/q](https://github.com/kriskowal/q) and call the `addPromise`
method to use that library with Chai HTTP. For example:

```js
var chai = require('chai');
chai.use(require('chai-http'));

// Add promise support if this does not exist natively.
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}
```

#### Retaining cookies with each request

Sometimes you need to keep cookies from one request, and send them with the
next. For this, `.request.agent()` is available:

```js
// Log in
var agent = chai.request.agent(app)
agent
  .post('/session')
  .send({ username: 'me', password: '123' })
  .then(function (res) {
    expect(res).to.have.cookie('sessionid');
    // The `agent` now has the sessionid cookie saved, and will send it
    // back to the server in the next request:
    return agent.get('/user/me')
      .then(function (res) {
         expect(res).to.have.status(200);
      })
  })
```

### .then (resolveCb, rejectCb)

* **@param** _{Function}_ resolveCB 
* **@cb** {Response}
* **@param** _{Function}_ rejectCB 
* **@cb** {Error}

Invoke the request to to the server. The response
will be passed as a parameter to the resolveCb,
while any errors will be passed to rejectCb.

```js
chai.request(app)
  .get('/')
  .then(function (res) {
    expect(res).to.have.status(200);
  }, function (err) {
     throw err;
  });
```

### .catch (rejectCb)

* **@param** _{Function}_ rejectCB 
* **@cb** {Error}

Invoke the request to to the server, catching any
errors with this callback. Behaves the same as
Promises.

```js
chai.request(app)
  .get('/')
  .catch(function (err) {
    throw err;
  });
```

## Assertions

The Chai HTTP module provides a number of assertions
for the `expect` and `should` interfaces.

### .status (code)

* **@param** _{Number}_ status number

Assert that a response has a supplied status.

```js
expect(res).to.have.status(200);
```

### .header (key[, value])

* **@param** _{String}_ header key (case insensitive)
* **@param** _{String|RegExp}_ header value (optional)

Assert that a `Response` or `Request` object has a header.
If a value is provided, equality to value will be asserted.
You may also pass a regular expression to check.

__Note:__ When running in a web browser, the
[same-origin policy](https://tools.ietf.org/html/rfc6454#section-3)
only allows Chai HTTP to read
[certain headers](https://www.w3.org/TR/cors/#simple-response-header),
which can cause assertions to fail.

```js
expect(req).to.have.header('x-api-key');
expect(req).to.have.header('content-type', 'text/plain');
expect(req).to.have.header('content-type', /^text/);
```

### .headers


Assert that a `Response` or `Request` object has headers.

__Note:__ When running in a web browser, the
[same-origin policy](https://tools.ietf.org/html/rfc6454#section-3)
only allows Chai HTTP to read
[certain headers](https://www.w3.org/TR/cors/#simple-response-header),
which can cause assertions to fail.

```js
expect(req).to.have.headers;
```

### .ip


Assert that a string represents valid ip address.

```js
expect('127.0.0.1').to.be.an.ip;
expect('2001:0db8:85a3:0000:0000:8a2e:0370:7334').to.be.an.ip;
```

### .json / .text / .html


Assert that a `Response` or `Request` object has a given content-type.

```js
expect(req).to.be.json;
expect(req).to.be.html;
expect(req).to.be.text;
```

### .redirect


Assert that a `Response` object has a redirect status code.

```js
expect(res).to.redirect;
```

### .redirectTo

* **@param** _{String}_ location url

Assert that a `Response` object redirects to the supplied location.

```js
expect(res).to.redirectTo('http://example.com');
```

### .param

* **@param** _{String}_ parameter name
* **@param** _{String}_ parameter value

Assert that a `Request` object has a query string parameter with a given
key, (optionally) equal to value

```js
expect(req).to.have.param('orderby');
expect(req).to.have.param('orderby', 'date');
expect(req).to.not.have.param('limit');
```

### .cookie

* **@param** _{String}_ parameter name
* **@param** _{String}_ parameter value

Assert that a `Request` or `Response` object has a cookie header with a
given key, (optionally) equal to value

```js
expect(req).to.have.cookie('session_id');
expect(req).to.have.cookie('session_id', '1234');
expect(req).to.not.have.cookie('PHPSESSID');
expect(res).to.have.cookie('session_id');
expect(res).to.have.cookie('session_id', '1234');
expect(res).to.not.have.cookie('PHPSESSID');
```

## License

(The MIT License)

Copyright (c) Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

