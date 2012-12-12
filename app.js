var http = require('http')
  , path = require('path')
  , url = require('url')
  , fs = require('fs')

var express = require('express')
  , resProto = require('express/lib/response')
  , cons = require('consolidate')
  , jade = require('jade')

function jadeCompile(content) {
  return jade.compile(content, { client: true, compileDebug: false })
    .toString()
    .replace(/<\/script/gi, '<\\/script')
}
function jadePath(pathname) {
  pathname = pathname.replace(/(\.jade)?\.js$/i, '') + '.jade'
  return path.join(__dirname, 'views', pathname)
}
function seajsJade(content) {
  return 'define(function(require, exports, module) {\n' +
    jadeCompile(content) +
    '\nmodule.exports = anonymous\n})'
}

resProto.writeView = function (view, options) {
  options = options || {}
  var self = this
  this.render(view, options, function (err, str) {
    if (err) return this.req.next(err)
    self.write(str)
  })
}
resProto.pipeView = function (selector, view, options) {
  options = options || {}
  var self = this
  fs.readFile(jadePath(view), 'utf8', function (err, content) {
    if (err) return self.req.next(err)
    self.write('<script>\nseajs.use("base", function (base) {\n')
    self.write('base.pipetemp("' + selector + '", (' + jadeCompile(content))
    self.write('(' + JSON.stringify(options, null, '  ') + ')))\n')
    self.write('});</script>')
  })
}


app = express()

app.engine('jade', cons.jade)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(express.static(path.join(__dirname, 'static')))

app.get('/js/jade/*', function (req, res, next) {
  fs.readFile(jadePath(req.params[0]), 'utf8', function (err, content) {
    if (err) return res.end('function () {};')
    res.setHeader('content-type', 'text/javascript; charset=utf-8')
    res.end(seajsJade(content))
  })
})

app.use(function (req, res, next) {
  res.writeView('layout')
  setTimeout(res.write.bind(res, '<div id="content"></div>'), 500)
  setTimeout(res.write.bind(res, '<p>See ya!</p>'), 1000)
  setTimeout(res.pipeView.bind(res, '#content', 'login'), 2000)
  setTimeout(res.write.bind(res, '</section></div></body>'), 3000)
  setTimeout(res.end.bind(res), 4000)
})

http.createServer(app).listen(3000)
