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

