/* jshint node:true */

'use strict';

var sse = exports;
sse.constructor = function sse() {};

var SSE = require('sse');

/** @const */
var SSE_PATH = '/sse/register';

sse.instance = null;

sse.create = function(server) {
  sse.instance = new SSE(server, { path: SSE_PATH });
};

sse.registerEvents = function() {
  sse.instance.on('connection', function(client) {
    console.log(client);
    client.send('hello client');
  });
};
