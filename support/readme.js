var dox = require('dox')
  , fs = require('fs')
  , join = require('path').join;

var out = fs.createWriteStream(join(__dirname, '../README.md'), { encoding: 'utf8' });

function line (str) {
  if(str) out.write(str);
  out.write('\n');
}

function parseDocs (docs) {
  docs
    .filter(function (chunk) {
      return !chunk.ignore && !chunk.isPrivate;
    })
    .forEach(function (chunk) {
      line(chunk.description.summary);

      if (chunk.tags.length) line();
      chunk.tags
        .forEach(function (tag) {
          switch (tag.type) {
            case 'param':
              line('* **@param** _{' + tag.types.join('|') + '}_ ' + tag.name + ' ' + tag.description);
              break;
            case 'return':
            case 'returns':
            case 'cb':
              line('* **@' + tag.type + '** ' + tag.string);
              break;
          }
        });

      line();
      line(chunk.description.body);
      line();
    });
}

var req = fs.readFileSync(join(__dirname, '../lib/request.js'), 'utf8')
  , req_docs = dox.parseComments(req, { raw: true })
  , http = fs.readFileSync(join(__dirname, '../lib/http.js'), 'utf8')
  , http_docs = dox.parseComments(http, { raw: true });

var header = fs.readFileSync(join(__dirname, '../docs/header.md'), 'utf8')
  , footer = fs.readFileSync(join(__dirname, '../docs/footer.md'), 'utf8');

line(header);
parseDocs(req_docs);
parseDocs(http_docs);
line(footer);
out.end();
