/* jshint node:true */

'use strict';

var http = require('http');
var path = require('path');

var express = require('express');
var helmet = require('helmet');

var api = require('./lib/routers/api');
var views = require('./lib/routers/views');

/** @const */
var PORT = process.env.PORT || 3000;

var app = express();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/static')));
app.use(api.router());
app.use(views.router());

app.use(helmet.xframe('allow-from', 'http://google.ca'));

var server = http.createServer(app);

server.listen(PORT, function(err) {
  if (err) {
    throw err;
  }

  console.log('SSE Server listening on port:', PORT);
});
