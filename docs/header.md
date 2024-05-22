# Chai HTTP

> HTTP integration testing with Chai assertions.

#### Features

- integration test request composition
- test http apps or external services
- assertions for common http tasks
- chai `expect` and `should` interfaces

#### Installation

This is an addon plugin for the [Chai Assertion Library](https://chaijs.com). Install via [npm](https://npmjs.org).

    npm install chai-http

#### Plugin

Use this plugin as you would all other Chai plugins.

```js
import chaiModule from "chai";
import chaiHttp from "chai-http";

const chai = chaiModule.use(chaiHttp);
```

To use Chai HTTP on a web page, please use the latest v4 version for now.