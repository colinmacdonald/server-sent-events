/* jshint node:true */

'use strict';

var sse = exports;
exports.constructor = function sse() {};

var redis = require('redis');

var publisher = redis.createClient();

/** @const */
var TIMEOUT = 1000 * 60 * 60;

var connections = {};

sse.connect = function(req, res) {
  // Prevents the request from timing out
  req.connection.setTimeout(TIMEOUT);
  req.socket.setNoDelay(true);

  // When the request closes clean up
  req.on('close', function() {
    subscriber.unsubscribe();
    subscriber.quit();
  });

  // Keeps the connection open
  res.status(200);
  res.set('Content-Type', 'text/event-stream');
  res.set('Cache-Control', 'no-cache');
  res.set('Connection', 'keep-alive');
  res.set('Transfer-encoding', 'identity');
  res.write('\n');

  var account = req.params.account;
  var app = req.params.app;
  var rooms = req.query.rooms;
  var subscriber = null;

  connections[account] = connections[account] || {};
  connections[account][app] = connections[account][app] || {};
  connections[account][app].rooms = rooms.split(',');

  if (connections[account][app].client) {
    subscriber = connections[account][app].client;

  } else {
    subscriber = redis.createClient();
    connections[account][app].client = subscriber;
  }

  connections[account][app].rooms.forEach(function(room) {
    subscriber.subscribe(account + '/' + app + '/' + room);
  });

  subscriber.on('error', function(err) {
    console.log('Redis Error:', err);
    res.write('error: ' + err.message + '\n\n');
  });

  subscriber.on('message', function(type, data) {
    var output = 'data: ' + data + '\n\n';
    res.write(output);
  });
};

sse.trigger = function(req, res) {
  var account = req.params.account;
  var app = req.params.app;
  var room = req.query.rooms;
  var data = req.query.data;

  publisher.publish(account + '/' + app + '/' + room, data);

  res.status(200);
};
