describe('request', function () {
  var request = require('../lib/request');
  var superagent = require('superagent');
  request.addPromises(global.Promise);

  it('is present on chai', function () {
    chai.expect(chai).to.respondTo('request');
  });

  it('request method returns instanceof superagent', function () {
    request('').get('/').should.be.instanceof(superagent.Request);
  });

  it('can request a functioned "app"', function (done) {
    var app = function (req, res) {
      req.headers['x-api-key'].should.equal('testing');
      res.writeHeader(200, { 'content-type' : 'text/plain' });
      res.end('hello universe');
    };

    request(app).get('/')
      .set('X-API-Key', 'testing')
      .end(function (err, res) {
        res.should.have.status(200);
        res.text.should.equal('hello universe');
        done(err);
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

  it('can be augmented with promises', function (done) {
    var app = function (req, res) {
      req.headers['x-api-key'].should.equal('test3');
      res.writeHeader(200, { 'content-type' : 'text/plain' });
      res.end('hello universe');
    };
    request(app)
      .get('/')
      .set('X-API-Key', 'test3')
      .then(function (res) {
        res.should.have.status(200);
        res.text.should.equal('hello universe');
        throw new Error('Testing catch');
      })
      .then(function () {
        throw new Error('This should not have fired');
      }, function (err) {
        if (err.message !== 'Testing catch') {
          throw err;
        }
      })
      .then(done, done);
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
      })
      .then(done, done);
  });

});
