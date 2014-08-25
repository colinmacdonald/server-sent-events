/* jshint browser:true */
/* global SSEClient */

(function() {
  'use strict';

  var sseClient = new SSEClient('/connect/1');
  sseClient.connect(function(err, event, es) {
    if (err) {
      throw err;
    }

    console.log('Connected');
    window.es = es;

    sseClient.on('message', function(event) {
      console.log('Message:', event.data);
    });

    sseClient.on('error', function(event) {
      console.log('Error:', event);
    });
  });
})();
