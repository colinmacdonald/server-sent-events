/* jshint node:true */

'use strict';

var api = exports;
exports.constructor = function api() {};

var express = require('express');

var sse = require('../sse');
sse.initialize();

/**
 * Creates and configures an express router for the API.
 * @public
 *
 * @return {Router} the configured express router
 */
api.router = function() {
  var router = new express.Router();

  router.get(
    '/connect/:account/:app',
    sse.connect
  );

  router.post(
    '/trigger/:account/:app',
    sse.trigger
  );

  return router;
};

