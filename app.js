
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var services = require('./routes/services');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.set('filesdir', path.join(__dirname, "public/files"));
app.use(express.favicon());
app.use(express.cookieParser("keyboard cat"));
app.use(express.session());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.multipart());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/', routes.post(app.get('filesdir')));
app.post('/delete', services.deleteAttachment(app.get('filesdir')));
app.get('/login', user.getLogin);
app.get('/newuser', user.getNewUser);
app.post('/login', user.postLogin);
app.post('/newuser', user.postNewUser);
app.post('/addComment', services.postComment);
app.post('/getComments',services.getComments);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
