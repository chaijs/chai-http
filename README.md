# Chai HTTP

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


## Integration Testing

Chai HTTP provides and interface for live integration
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
to listen on for tha given test.

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

### .req (cb)

* **@param** _{Function}_ callback 
* **@cb** {Request} object
* **@cb** {Function} next (optional)
* **@returns** {this} for chaining

You may optionally use `.req` chainable to hook
into the the request preperation invocation. Use
this to modify the request object to include post
or querystring parameters, attach a file for
upload, or any other operation that superagent
provides.

```js
chai.request(app)
  .get('/')
  .req(function (req) {
    req.set('x-api-key', 'abc123');
  })
```


### .res (cb)

* **@param** _{Function}_ callback 
* **@cb** {Response}

Invoke the request to to the server. The response
will be passed as a paramter to this function so
that further testing may be done. Use the `chai-http`
assertions for testing.

```js
chai.request(app)
  .get('/')
  .res(function (res) {
    expect(res).to.have.status(200);
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

* **@param** _{String}_ header key
* **@param** _{String}_ header value (optional)

Assert that an object has a header. If a value is
provided, equality to value will be asserted.

```js
expect(req).to.have.header('x-api-key');
expect(req).to.have.header('content-type', 'text/plain');
```


### .headers


Assert that an object has headers.

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

