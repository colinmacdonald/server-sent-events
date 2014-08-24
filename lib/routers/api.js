/* jshint node:true */

'use strict';

var api = exports;
exports.constructor = function api() {};

var express = require('express');

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

  return router;
};

/**
 * Handles the create route.
 * @private
 */
api.create = function(req, res) {
  res.status(200).send({ test: 1234 });
};
