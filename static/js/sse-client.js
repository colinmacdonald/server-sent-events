/* jshint browser:true */
/* global EventSource */

(function() {
  'use strict';

  var _ = window._;
  var $ = window.$;

  /** @exports */
  window.SSEClient = SSEClient;

  /** @const */
  var BASE = 'http://localhost:3000/';
  var PATH = BASE + 'connect/';
  var TIMEOUT = 5000;

  function SSEClient(account, app, rooms) {
    this.path = PATH + account + '/' + app + '/';

    rooms = rooms ? rooms : 'lobby';
    this.account = account;
    this.app = app;
    this.rooms = rooms instanceof Array ? rooms : [rooms];

    this.es = null;

    _.bindAll(this, [
      'connect',
      'send'
    ]);
  }

  SSEClient.prototype.connect = function(cb) {
    var url = this.path + '?rooms=' + this.rooms.toString();
    this.es = new EventSource(url);

    var timeout = window.setTimeout(function() {
      return cb(new Error('Connection request timed out.'));
    }, TIMEOUT);

    var self = this;

    this.on('connected', function(event) {
      if (!event || event.type !== 'open') {
        return cb(new Error('Connection failed.'));
      }

      window.clearTimeout(timeout);
      return cb(null, event, self.es);
    });
  };

  SSEClient.prototype.send = function(rooms, data, cb) {
    var opts = {
      type: 'POST',
      url: BASE + 'trigger/' + this.account + '/' + this.app + '/?rooms=' +
        rooms + '&data=' + data,
      success: function() {
        cb(null, data);
      },
      error: function(res) {
        cb(new Error('Error: ' + res.status));
      }
    };

    $.ajax(opts);
  };

  SSEClient.prototype.on = function(type, cb) {
    var method = null;

    switch(type) {
      case 'message':
        method = 'onmessage';
        break;
      case 'error':
        method = 'onerror';
        break;
      case 'connected':
        method = 'onopen';
        break;
    }

    if (!method) {
      throw new Error('Invalid event type.');
    }

    this.es[method] = cb;
  };
})();
