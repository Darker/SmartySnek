import * as debug from "debug";
import express from "express";
import * as path from "path";
import * as favicon from "serve-favicon";
import logger from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import * as http from "http";

const PORT = process.env.PORT || 8080;

var app = express();
console.log(import.meta.url);

const server = http.createServer(function (req, res) {
    return app(req, res);
});
// view engine setup


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
const staticDir = path.join(path.dirname(import.meta.url.replace("file:///", "")), '../web');
console.log("Static content at: ", staticDir);
app.use(express.static(staticDir));

app.set('port', PORT);

//var server = app.listen(app.get('port'), function () {
//    debug('Express server listening on port ' + server.address().port);
//});

server.listen(PORT, function () {
    console.log('listening on http://localhost:' + PORT);
});
