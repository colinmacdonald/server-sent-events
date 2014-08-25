/* jshint node:true */

'use strict';

var api = exports;
exports.constructor = function api() {};

var express = require('express');
var redis = require('redis');

/** @const */
var TIMEOUT = 1000 * 60 * 60;

var publisher = redis.createClient();

/**
 * Creates and configures an express router for the API.
 * @public
 *
 * @return {Router} the configured express router
 */
api.router = function() {
  var router = new express.Router();

  router.get(
    '/connect/:session_id',
    api.connect
  );

  router.get(
    '/trigger/:session_id/:event_name',
    api.trigger
  );

  return router;
};

/**
 * Handles the sse connection
 * @private
 */
api.connect = function(req, res) {
  req.connection.setTimeout(TIMEOUT);
  req.socket.setNoDelay(true);

  var id = req.params.session_id;
  var subscriber = redis.createClient();
  subscriber.subscribe('updates-' + id);

  subscriber.on('error', function(err) {
    console.log('Redis Error:', err);
  });

  subscriber.on('message', function(msg, data) {
    var output = 'data: ' + msg.toUpperCase() + ': ' + data + '\n\n';
    res.write(output);
  });

  res.status(200);
  res.set('Content-Type', 'text/event-stream');
  res.set('Cache-Control', 'no-cache');
  res.set('Connection', 'keep-alive');
  res.set('Transfer-encoding', 'identity');
  res.write('\n');

  req.on('close', function() {
    subscriber.unsubscribe();
    subscriber.quit();
  });
};

/**
 * Handles the sse triggers
 * @private
 */
api.trigger = function(req, res) {
  var id = req.params.session_id;
  var event = req.params.event_name;
  publisher.publish('updates-' + id, event + ': YEAH!');

  res.status(200);
  res.set('Content-Type', 'text/html');
  res.send('Broadcast Event: ' + req.params.event_name);
};
