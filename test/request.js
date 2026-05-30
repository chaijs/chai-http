import superagent from 'superagent';
import {request} from 'chai-http';
import polka from 'polka';

const SERVER_URL = 'http://localhost:8008';

describe('request', function () {
  let server;
  let aborter;

  beforeEach(() => {
    aborter = new AbortController();
    server = polka();
    server.listen({
      port: 8008,
      signal: aborter.signal
    });
  });

  afterEach(() => {
    aborter.abort();
  });

  describe('Browser and Node.js', function () {
    it('is present on chai', function () {
      expect(chai.request).to.not.eq('undefined');
      expect(chai.request).to.respondTo('execute');
    });

    it('request method returns instanceof superagent', function () {
      server.get('/', (_req, res) => {
        res.statusCode = 200;
      });
      const req = request.execute(SERVER_URL).get('/');
      req.should.be.instanceof(request.Request.super_);
      req.should.be.instanceof(superagent.Request);
    });

    it('can request a web page', function (done) {
      server.get('/foo', (_req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'text/html');
        res.end('<h1>bleep bloop</h1>');
      });

      request
        .execute(SERVER_URL)
        .get('/foo')
        .end(function (err, res) {
          res.should.have.status(200);
          res.should.be.html;
          res.should.not.be.text;
          res.should.not.be.json;
          res.text.should.be.a('string').with.length.above(0);

          res.body.should.deep.equal({});

          done(err);
        });
    });

    it('can request JSON data', function (done) {
      server.get('/foo', (_req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.end('{"foo":"bar"}');
      });

      request
        .execute(SERVER_URL)
        .get('/foo')
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
      server.get('/foo', (_req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.setHeader('x-foo', '303');
        res.setHeader('x-bar', '808');
        res.end('{"foo":"bar"}');
      });

      request
        .execute(SERVER_URL)
        .get('/foo')
        .end(function (err, res) {
          res.should.be.json;
          res.headers.should.have.property('x-foo', '303');
          res.headers.should.have.property('x-bar', '808');
          done(err);
        });
    });

    it('succeeds when response has an error status', function (done) {
      server.get('/foo', (_req, res) => {
        res.statusCode = 404;
        res.end();
      });
      request
        .execute(SERVER_URL)
        .get('/foo')
        .end(function (err, res) {
          res.should.have.status(404);
          done(err);
        });
    });

    it('can be augmented with promises', async function () {
      server.get('/foo', (_req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.end('{"foo":"bar"}');
      });
      const response = await request
        .execute(SERVER_URL)
        .get('/foo');
      response.should.have.status(200);
      response.should.be.json;
    });

    it('can resolve a promise given status code of 404', async function () {
      server.get('/foo', (_req, res) => {
        res.statusCode = 404;
        res.end();
      });

      const response = await request
        .execute(SERVER_URL)
        .get('/foo');
      response.should.have.status(404);
    });
  });

  describe('Node.js', function () {
    it('can request a functioned "app"', function (done) {
      const app = function (req, res) {
        req.headers['x-api-key'].should.equal('testing');
        res.writeHeader(200, {'content-type': 'text/plain'});
        res.end('hello universe');
      };

      request
        .execute(app)
        .get('/')
        .set('X-API-Key', 'testing')
        .end(function (err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          res.text.should.equal('hello universe');
          done();
        });
    });

    it('can request an already existing url', function (done) {
      const server = http.createServer(function (req, res) {
        req.headers['x-api-key'].should.equal('test2');
        res.writeHeader(200, {'content-type': 'text/plain'});
        res.end('hello world');
      });

      server.listen(0, function () {
        request
          .execute('http://127.0.0.1:' + server.address().port)
          .get('/')
          .set('X-API-Key', 'test2')
          .end(function (err, res) {
            res.should.have.status(200);
            res.text.should.equal('hello world');
            server.once('close', function () {
              done(err);
            });
            server.close();
          });
      });
    });

    it('agent can be used to persist cookies', function (done) {
      const app = function (req, res) {
        res.setHeader('Set-Cookie', 'mycookie=test');
        res.writeHeader(200, {'content-type': 'text/plain'});
        res.end('your cookie: ' + req.headers.cookie);
      };
      const agent = request.agent(app);

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
          agent.close();
        })
        .then(done, done);
    });

    it('agent can be used to set default headers', function (done){
      var agent = request.agent('https://httpbin.org');
      agent.set("Header-Name", "header_value");

      agent
        .get('/headers')
        .then(function (res){
          res.should.have.status(200);
          res.body.headers.should.have.property('Header-Name').that.equals("header_value");
          agent.close();
        })
        .then(done, done);
    });

    it('agent can be used to set default bearer authentication', function (done){
      var agent = request.agent('https://httpbin.org');
      agent.set("Authorization", "Bearer test_bearer");

      agent
        .get('/bearer')
        .then(function (res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('authenticated').that.equals(true);
          res.body.should.have.property('token').that.equals("test_bearer");
          agent.close();
        })
        .then(done, done);
    });

    it('agent can be used to set default basic authentication', function (done){
      var agent = request.agent('https://httpbin.org');
      agent.auth("user", "passwd");

      agent
        .get('/basic-auth/user/passwd')
        .then(function (res){
          res.should.have.status(200);
          agent.close();
        })
        .then(done, done);
    });

    it('automatically closes the server down once done with it', function (done) {
      const server = http.createServer(function (_req, res) {
        res.writeHeader(200, {'content-type': 'text/plain'});
        res.end('hello world');
      });

      request
        .execute(server)
        .get('/')
        .end(function (err, res) {
          res.should.have.status(200);
          res.text.should.equal('hello world');
          should.not.exist(server.address());
          done(err);
        });
    });

    it('can use keepOpen() to not close the server', function (done) {
      const server = http.createServer(function (_req, res) {
        res.writeHeader(200, {'content-type': 'text/plain'});
        res.end('hello world');
      });
      const cachedRequest = request.execute(server).keepOpen();
      server.listen = function () {
        throw new Error('listen was called when it shouldnt have been');
      };
      cachedRequest.get('/').end(function (err) {
        cachedRequest.get('/').end(function (err2) {
          server.close(function () {
            done(err || err2);
          });
        });
      });
    });

    it('can close server after using keepOpen()', function (done) {
      const server = http.createServer(function (_req, res) {
        res.writeHeader(200, {'content-type': 'text/plain'});
        res.end('hello world');
      });
      const cachedRequest = request.execute(server).keepOpen();
      cachedRequest.close(function () {
        should.not.exist(server.address());
        done();
      });
    });
  });
});
