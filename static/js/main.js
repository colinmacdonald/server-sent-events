/* jshint browser:true */
/* global SSEClient */

(function() {
  'use strict';

  var $ = window.$;

  var sseClient = new SSEClient('myAccount', 'myApp', 'lobby');

  function connect() {
    console.log('connecting...');
    sseClient.connect(function(err, conn, es) {
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
  }

  function send() {
    sseClient.send('lobby', 'test1234', function(err, data) {
      if (err) {
        throw err;
      }
    });
  }

  $(document).ready(function() {
    var $connect = $('.connect-btn');
    var $send = $('.send-btn');

    $connect.click(connect);
    $send.click(send);
  });

})();
