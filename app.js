var express = require('express');
var http = require('http');
var routes = require('./routes');
var config = require('./config.js').config;
var partials = require('express-partials');
var app = express();
var staticDir = __dirname + '/public';
var themeStaticDir = __dirname + '/views/theme/' + config.theme + '/assets';
var adminStaticDir = __dirname + '/views/admin/assets';
app.configure(function() {
  app.set('port', config.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.compress());
  app.use(partials());
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: config.session_secret}));
});
app.configure('development', function() {
  app.use("/admin/assets", express.static(adminStaticDir));
  app.use("/theme/assets", express.static(themeStaticDir));
  app.use(express.static(staticDir));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});
app.configure('production', function() {
  app.use("/admin/assets", express.static(adminStaticDir));
  app.use("/theme/assets", express.static(themeStaticDir));
  app.use(express.static(staticDir, {
    maxAge: 1000 * 24 * 60 * 60 * 365
  }));
  app.use(express.errorHandler());
  app.set('view cache', true);
});
routes(app);
http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
