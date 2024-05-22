# Chai HTTP  [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![NPM version](https://img.shields.io/npm/v/chai-http.svg)](https://img.shields.io/npm/v/chai-http.svg)

> HTTP integration testing with Chai assertions.

#### Features

- integration test request composition
- test http apps or external services
- assertions for common http tasks
- chai `expect` and `should` interfaces

#### Installation

This is an addon plugin for the [Chai Assertion Library](https://www.chaijs.com/). Install via [npm](https://www.npmjs.com/).

    npm install chai-http

#### Plugin

Use this plugin as you would all other Chai plugins.

```js
import chaiModule from "chai";
import chaiHttp from "chai-http";

const chai = chaiModule.use(chaiHttp);
```

To use Chai HTTP on a web page, please use the latest v4 version for now.

## Integration Testing

Chai HTTP provides an interface for live integration
testing via [superagent](https://github.com/ladjs/superagent).
To do this, you must first
construct a request to an application or url.

Upon construction you are provided a chainable api that
allows you to specify the http VERB request (get, post, etc)
that you wish to invoke.

#### Application / Server

You may use a function (such as an express or connect app)
or a node.js http(s) server as the foundation for your request.
If the server is not running, chai-http will find a suitable
port to listen on for a given test.

__Note:__ This feature is only supported on Node.js, not in web browsers.

```js
chai.request.execute(app)
  .get('/')
```

When passing an `app` to `request`; it will automatically open the server for
incoming requests (by calling `listen()`) and, once a request has been made
the server will automatically shut down (by calling `.close()`). If you want to
keep the server open, perhaps if you're making multiple requests, you must call
`.keepOpen()` after `.request()`, and manually close the server down:

```js
const requester = chai.request.Request(app).keepOpen()

Promise.all([
  requester.get('/a'),
  requester.get('/b'),
])
.then(responses => { /* ... */ })
.then(() => requester.close())
```


#### URL

You may also use a base url as the foundation of your request.

```js
chai.request.execute('http://localhost:8080')
  .get('/')
```

#### Setting up requests

Once a request is created with a given VERB (get, post, etc), you chain on these additional methods to create your request:

| Method  | Purpose  |
|---|---|
| `.set(key, value)` | Set request headers  |
| `.send(data)` |  Set request data (default type is JSON) |
| `.type(dataType)` | Change the type of the data sent from the `.send()` method (xml, form, etc) |
| `.attach(field, file, attachment)` | Attach a file | 
| `.auth(username, password)` | Add auth headers for Basic Authentication |
| `.query(parmasObject)` |  Chain on some GET parameters |

Examples:

`.set()`
```js
// Set a request header
chai.request.execute(app)
  .put('/user/me')
  .set('Content-Type', 'application/json')
  .send({ password: '123', confirmPassword: '123' })
```

`.send()`
```js
// Send some JSON
chai.request.execute(app)
  .put('/user/me')
  .send({ password: '123', confirmPassword: '123' })
```

`.type()`
```js
// Send some Form Data
chai.request.execute(app)
  .post('/user/me')
  .type('form')
  .send({
    '_method': 'put',
    'password': '123',
    'confirmPassword': '123'
  })
```

`.attach()`
```js
// Attach a file
chai.request.execute(app)
  .post('/user/avatar')
  .attach('imageField', fs.readFileSync('avatar.png'), 'avatar.png')
```

`.auth()`
```js
// Authenticate with Basic authentication
chai.request.execute(app)
  .get('/protected')
  .auth('user', 'pass')
  
// Authenticate with Bearer Token
chai.request.execute(app)
  .get('/protected')
  .auth(accessToken, { type: 'bearer' })  
  
```

`.query()`
```js
// Chain some GET query parameters
chai.request.execute(app)
  .get('/search')
  .query({name: 'foo', limit: 10}) // /search?name=foo&limit=10
```

#### Dealing with the response - traditional

In the following examples we use Chai's Expect assertion library:

```js
const { expect } = chai;
```

To make the request and assert on its response, the `end` method can be used:

```js
chai.request.execute(app)
  .put('/user/me')
  .send({ password: '123', confirmPassword: '123' })
  .end((err, res) => {
     expect(err).to.be.null;
     expect(res).to.have.status(200);
  });
```

##### Caveat

Because the `end` function is passed a callback, assertions are run
asynchronously. Therefore, a mechanism must be used to notify the testing
framework that the callback has completed. Otherwise, the test will pass before
the assertions are checked.

For example, in the [Mocha test framework](https://mochajs.org//), this is
accomplished using the
[`done` callback](https://mochajs.org/#asynchronous-code), which signal that the
callback has completed, and the assertions can be verified:

```js
it('fails, as expected', function(done) { // <= Pass in done callback
  chai.request.execute('http://localhost:8080')
  .get('/')
  .end((err, res) => {
    expect(res).to.have.status(123);
    done();                               // <= Call done to signal callback end
  });
});

it('succeeds silently!', () => {   // <= No done callback
  chai.request.execute('http://localhost:8080')
  .get('/')
  .end((err, res) => {
    expect(res).to.have.status(123);    // <= Test completes before this runs
  });
});
```

When `done` is passed in, Mocha will wait until the call to `done()`, or until
the [timeout](https://mochajs.org/#timeouts) expires. `done` also accepts an
error parameter when signaling completion.

#### Dealing with the response - Promises

If `Promise` is available, `request()` becomes a Promise capable library -
and chaining of `then`s becomes possible:

```js
chai.request.execute(app)
  .put('/user/me')
  .send({ password: '123', confirmPassword: '123' })
  .then((res) => {
     expect(res).to.have.status(200);
  })
  .catch((err) => {
     throw err;
  });
```

#### Retaining cookies with each request

Sometimes you need to keep cookies from one request, and send them with the
next (for example, when you want to login with the first request, then access an authenticated-only resource later). For this, `.request.agent()` is available:

```js
// Log in
const agent = chai.request.agent(app)
agent
  .post('/session')
  .send({ username: 'me', password: '123' })
  .then((res) => {
    expect(res).to.have.cookie('sessionid');
    // The `agent` now has the sessionid cookie saved, and will send it
    // back to the server in the next request:
    return agent.get('/user/me')
      .then((res) => {
         expect(res).to.have.status(200);
      });
  });
```

Note: The server started by `chai.request.agent(app)` will not automatically close following the test(s). You should call `agent.close()` after your tests to ensure your program exits.

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
[same-origin policy](https://datatracker.ietf.org/doc/html/rfc6454#section-3)
only allows Chai HTTP to read
[certain headers](https://fetch.spec.whatwg.org/#http-responses),
which can cause assertions to fail.

```js
expect(req).to.have.header('x-api-key');
expect(req).to.have.header('content-type', 'text/plain');
expect(req).to.have.header('content-type', /^text/);
```

### .headers


Assert that a `Response` or `Request` object has headers.

__Note:__ When running in a web browser, the
[same-origin policy](https://datatracker.ietf.org/doc/html/rfc6454#section-3)
only allows Chai HTTP to read
[certain headers](https://fetch.spec.whatwg.org/#http-responses),
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

### .charset



Assert that a `Response` or `Request` object has a given charset.

```js
expect(req).to.have.charset('utf-8');
```

### .redirect


Assert that a `Response` object has a redirect status code.

```js
expect(res).to.redirect;
expect(res).to.not.redirect;
```

### .redirectTo

* **@param** _{String|RegExp}_ location url

Assert that a `Response` object redirects to the supplied location.

```js
expect(res).to.redirectTo('http://example.com');
expect(res).to.redirectTo(/^\/search\/results\?orderBy=desc$/);
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

## Releasing

`chai-http` is released with [`semantic-release`](https://github.com/semantic-release/semantic-release) using the plugins:
- [`commit-analyzer`](https://github.com/semantic-release/commit-analyzer) to determine the next version from commit messages.
- [`release-notes-generator`](https://github.com/semantic-release/release-notes-generator) to summarize release in
- [`changelog`](https://github.com/semantic-release/changelog) to update the CHANGELOG.md file.
- [`github`](https://github.com/semantic-release/github) to publish a [GitHub release](https://github.com/chaijs/chai-http/releases).
- [`git`](https://github.com/semantic-release/git) to commit release assets.
- [`npm`](https://github.com/semantic-release/npm) to publish to [npm](https://www.npmjs.com/package/chai-http).

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

