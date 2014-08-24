/* jshint browser:true */
/* global SSEClient */

(function() {
  'use strict';

  var sseClient = new SSEClient('sse/register');
  sseClient.connect(function(err) {
    if (err) {
      throw err;
    }

    console.log('Connected');

    sseClient.on('message', function(event) {
      console.log('Message:', event.data);
    });

    sseClient.on('error', function(event) {
      console.log('Error:', event);
    });
  });
})();
