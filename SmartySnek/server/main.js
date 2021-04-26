var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;

var app = express();
var createServer = require('http').createServer;

const server = createServer(function (req, res) {
    return app(req, res);
});
// view engine setup


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../web')));

app.set('port', PORT);

//var server = app.listen(app.get('port'), function () {
//    debug('Express server listening on port ' + server.address().port);
//});

server.listen(PORT, function () {
    console.log('listening on http://localhost:' + PORT);
});
