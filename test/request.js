describe('request', function () {

  it('is present on chai', function () {
    chai.expect(chai).to.respondTo('request');
  });

  it('can request a functioned "app"', function (done) {
    var app = function (req, res) {
      req.headers['x-api-key'].should.equal('testing');
      res.writeHeader(200, { 'content-type' : 'text/plain' });
      res.end('hello universe');
    }

    chai.request(app).get('/')
      .req(function (req) {
        req.set('X-API-Key', 'testing')
      })
      .res(function (res) {
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

    server.listen(4000, function () {
      chai.request('http://127.0.0.1:4000')
        .get('/')
        .req(function (req) {
          req.set('X-API-Key', 'test2')
        })
        .res(function (res) {
          res.should.have.status(200);
          res.text.should.equal('hello world');
          server.once('close', done);
          server.close();
        });
    });

  });

});
