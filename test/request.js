describe('request', function () {
  var request = require('../lib/request');
  var superagent = require('superagent');

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

});
