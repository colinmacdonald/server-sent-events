/* jshint browser:true */
/* global EventSource */

(function() {
  'use strict';

  /** @exports */
  window.SSEClient = SSEClient;

  /** @const */
  var TIMEOUT = 5000;

  function SSEClient(path) {
    this.path = path;
    this.es = null;
  }

  SSEClient.prototype.connect = function(cb) {
    this.es = new EventSource(this.path);

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
