/* jshint node:true */

'use strict';

var sse = exports;
exports.constructor = function sse() {};

var _ = require('lodash');
var redis = require('redis');

var subscriber = null;
var publisher = null;

/** @const */
var TIMEOUT = 1000 * 60 * 60;

var connections = {};

sse.initialize = function() {
  subscriber = redis.createClient();
  publisher = redis.createClient();

  subscriber.on('message', function(type, data) {
    var paramsArr = type.split('/');
    var app = connections[paramsArr[0]][paramsArr[1]];

    if (!app || !app.users || !app.rooms[paramsArr[2]]) {
      console.log('error: ', 'no users found');
      return;
    }

    var output = 'data: ' + data + '\n\n';
    _.each(app.users, function(user) {
      user.res.write(output);
    });
  });
};

sse.connect = function(req, res) {
  // Prevents the request from timing out
  req.connection.setTimeout(TIMEOUT);
  req.socket.setNoDelay(true);

  req.on('close', function() {
    // Clean up this connection
  });

  var userId = Math.floor(Math.random() * 9999999999);

  // Keeps the connection open
  res.status(200);
  res.set('Content-Type', 'text/event-stream');
  res.set('Cache-Control', 'no-cache');
  res.set('Connection', 'keep-alive');
  res.set('Transfer-Encoding', 'identity');
  res.set('User-Id', userId);
  res.write('\n');

  var account = req.params.account;
  var app = req.params.app;
  var rooms = req.query.rooms.split(',');

  connections[account] = connections[account] || {};
  connections[account][app] = connections[account][app] || {};
  connections[account][app].rooms = connections[account][app].rooms || {};
  connections[account][app].users =
    connections[account][app].users || {};

  connections[account][app].users[userId] = {};

  connections[account][app].users[userId].req = req;
  connections[account][app].users[userId].res = res;

  rooms.forEach(function(room) {
    if (connections[account][app].rooms[room]) {
      return;
    }

    connections[account][app].rooms[room] = true;
    subscriber.subscribe(account + '/' + app + '/' + room);
  });
};

sse.trigger = function(req, res) {
  var account = req.params.account;
  var app = req.params.app;
  var room = req.query.rooms;
  var data = req.query.data;

  publisher.publish(account + '/' + app + '/' + room, data);

  res.status(200).end();
};
