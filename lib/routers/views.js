/* jshint node:true */

'use strict';

var views = exports;
exports.constructor = function api() {};

var express = require('express');

/**
 * Creates and configures an express router for the views.
 * @public
 *
 * @return {Router} the configured express router
 */
views.router = function() {
  var router = new express.Router();

  router.get(
    '/status',
    views.status
  );

  router.get(
    '/test',
    views.test
  );

  return router;
};

/**
 * Renders the status view.
 * @private
 */
views.status = function(req, res) {
  res.render('status');
};

/**
 * Renders the test view.
 */
views.test = function(req, res) {
  res.render('test');
};
