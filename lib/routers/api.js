/* jshint node:true */

'use strict';

var api = exports;
exports.constructor = function api() {};

var express = require('express');
var redis = require('redis');

var publisher = redis.createClient();

var id = 0;

/**
 * Creates and configures an express router for the API.
 * @public
 *
 * @return {Router} the configured express router
 */
api.router = function() {
  var router = new express.Router();

  router.get(
    '/',
    api.create
  );

  router.get(
    '/connect',
    api.connect
  );

  router.get(
    '/trigger/:event_name',
    api.trigger
  );

  return router;
};

/**
 * Handles the create route.
 * @private
 */
api.create = function(req, res) {
  res.status(200).send({ test: 1234 });
};

/**
 * Handles the sse connection
 * @private
 */
api.connect = function(req, res) {
  req.socket.setNoDelay(true);

  var subscriber = redis.createClient();
  subscriber.subscribe('updates');

  subscriber.on('error', function(err) {
    console.log('Redis Error:', err);
  });

  subscriber.on('message', function(msg, data) {
    id++;

    res.write(msg.toUpperCase() + ': ' + data + '\n\n');
  });

  res.status(200);
  res.set('Content-Type', 'text/event-stream');
  res.set('Cache-Control', 'no-cache');
  res.set('Connection', 'keep-alive');
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
  publisher.publish('updates', req.params.event_name + 'YEAH!');

  res.status(200);
  res.set('Content-Type', 'text/html');
  res.send('Broadcast Event: ' + req.params.event_name);
};
