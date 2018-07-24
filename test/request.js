describe('request', function () {
  var isNode = typeof process === 'object';
  var isBrowser = typeof window === 'object';
  var request = chai.request;

  describe('Browser and Node.js', function () {
    it('is present on chai', function () {
      expect(chai).to.respondTo('request');
    });

    it('request method returns instanceof superagent', function () {
      var req = request('').get('/');
      req.should.be.instanceof(request.Test.super_);
      if (isNode) {
        req.should.be.instanceof(require('superagent').Request);
      }
    });

    it('can request a web page', function (done) {
      request('https://httpbin.org')
        .get('/html')
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.html;
          res.should.not.be.text;
          res.should.not.be.json;
          res.text.should.be.a('string').with.length.above(0);

          // Slightly different behavior in SuperAgent in Node/browsers
          isNode && res.body.should.deep.equal({});
          isBrowser && expect(res.body).to.be.null;

          done(err);
        });
    });

    it('can request JSON data', function (done) {
      request('https://httpbin.org')
        .get('/get')
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.should.not.be.html;
          res.should.not.be.text;
          res.text.should.be.a('string').with.length.above(0);
          res.body.should.be.an('object');
          done(err);
        });
    });

    it('can read response headers', function (done) {
      request('https://httpbin.org')
        .get('/response-headers')
        .query({'content-type': 'application/json'})
        .query({'pragma': 'test1'})
        .query({'location': 'test2'})
        .query({'x-api-key': 'test3'})
        .end(function (err, res) {
          res.should.have.status(200);

          // Content-Type and Pragma are supported on Node and browser
          res.should.be.json;
          res.should.have.header('Content-Type', /json$/);
          res.should.have.header('Pragma', 'test1');

          // When running in a browser, only "simple" headers are readable
          // https://www.w3.org/TR/cors/#simple-response-header
          isNode && res.should.have.header('Location', 'test2');
          isNode && res.should.have.header('X-API-Key', 'test3');
          isBrowser && res.should.not.have.header('Location');
          isBrowser && res.should.not.have.header('X-API-Key');

          done(err);
        });
    });

    it('succeeds when response has an error status', function (done) {
      request('https://httpbin.org')
        .get('/status/400')
        .end(function (err, res) {
          res.should.have.status(400);
          done(err);
        });
    });

    it('can be augmented with promises', function (done) {
      request('https://httpbin.org')
        .get('/get')
        .set('X-API-Key', 'test3')
        .then(function (res) {
          res.should.have.status(200);
          res.body.headers['X-Api-Key'].should.equal('test3');
          throw new Error('Testing catch');
        })
        .then(function () {
          throw new Error('This should not have fired');
        })
        .catch(function (err) {
          if (err.message !== 'Testing catch') {
            throw err;
          }
        })
        .then(done, done);
    });

    it('can resolve a promise given status code of 400', function () {
      return request('https://httpbin.org')
        .get('/status/400')
        .then(function (res) {
          res.should.have.status(400);
        });
    });
  });

  isNode && describe('Node.js', function () {
    it('can request a functioned "app"', function (done) {
      var app = function (req, res) {
        req.headers['x-api-key'].should.equal('testing');
        res.writeHeader(200, { 'content-type' : 'text/plain' });
        res.end('hello universe');
      };

      request(app).get('/')
        .set('X-API-Key', 'testing')
        .end(function (err, res) {
          if (err) return done(err)
          res.should.have.status(200);
          res.text.should.equal('hello universe');
          done();
        });
    });

    it('can request an already existing url', function (done) {
      var server = require('http').createServer(function (req, res) {
        req.headers['x-api-key'].should.equal('test2');
        res.writeHeader(200, { 'content-type' : 'text/plain' });
        res.end('hello world');
      });

      server.listen(0, function () {
        request('http://127.0.0.1:' + server.address().port)
          .get('/')
          .set('X-API-Key', 'test2')
          .end(function (err, res) {
            res.should.have.status(200);
            res.text.should.equal('hello world');
            server.once('close', function () { done(err); });
            server.close();
          });
      });

    });

    it('agent can be used to persist cookies', function (done) {
      var app = function (req, res) {
        res.setHeader('Set-Cookie', 'mycookie=test');
        res.writeHeader(200, { 'content-type' : 'text/plain' });
        res.end('your cookie: ' + req.headers.cookie);
      };
      var agent = request.agent(app);

      agent
        .get('/')
        .then(function (res) {
          res.headers['set-cookie'][0].should.equal('mycookie=test');
          res.text.should.equal('your cookie: undefined');
        })
        .then(function () {
          return agent.get('/');
        })
        .then(function (res) {
          res.text.should.equal('your cookie: mycookie=test');
          agent.close()
        })
        .then(done, done);
    });

    it('automatically closes the server down once done with it', function (done) {
      var server = require('http').createServer(function (req, res) {
        res.writeHeader(200, { 'content-type' : 'text/plain' });
        res.end('hello world');
      });

      request(server)
          .get('/')
          .end(function (err, res) {
            res.should.have.status(200);
            res.text.should.equal('hello world');
            should.not.exist(server.address())
            done(err)
          });
    });

    it('can use keepOpen() to not close the server', function (done) {
      var server = require('http').createServer(function (req, res) {
        res.writeHeader(200, { 'content-type' : 'text/plain' });
        res.end('hello world');
      });
      var cachedRequest = request(server).keepOpen();
      server.listen = function () { throw new Error('listen was called when it shouldnt have been') }
      cachedRequest.get('/') .end(function (err, res) {
        cachedRequest.get('/').end(function (err2, res) {
          server.close(function () { done(err || err2) })
        })
      });
    });

  it('can close server after using keepOpen()', function (done) {
    var server = require('http').createServer(function (req, res) {
      res.writeHeader(200, { 'content-type' : 'text/plain' });
      res.end('hello world');
    });
    var cachedRequest = request(server).keepOpen();
    cachedRequest.close(function (err) {
      should.not.exist(server.address());
      done();
    });
  });

});

  isBrowser && describe('Browser', function () {
    it('cannot request a functioned "app"', function () {
      function tryToRequestAFunctionedApp() {
        var app = function () {};
        request(app);
      }
      expect(tryToRequestAFunctionedApp).to.throw(Error,
        /http.createServer is not a function|createServer/);
    });

    it('agent can be used to persist cookies', function (done) {
      var agent = request.agent('https://httpbin.org');

      agent
        .get('/cookies/set')
        .query({foo: 'bar', biz: 'baz'})
        .then(function (res) {
          // When running in a web browser, cookies are protected and cannot be read by SuperAgent.
          // They ARE set, but only the browser has access to them.
          expect(res.headers['set-cookie']).to.be.undefined;
          res.should.not.have.cookie('foo');
          res.should.not.have.cookie('bar');
        })
        .then(function () {
          // When making a subsequent request to the same server, the cookies will be sent
          return agent.get('/cookies');
        })
        .then(function (res) {
          // HttpBin echoes the cookies back as JSON
          res.body.cookies.foo.should.equal('bar');
          res.body.cookies.biz.should.equal('baz');
        })
        .then(done, done);
    });
  });
});
