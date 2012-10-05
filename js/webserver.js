/* Author: Robert Chrzanowski */

/*jslint
  node: true, devel: true, indent: 2 */

(function () {
  'use strict';

  var http, httpServer, port,
    web, server;

  port = 8124;

  // node modules
  http = require('http');

  // bolo modules
  web = require('./web.js');
  server = require('./server.js');

  // host basic web site
  httpServer = http.createServer();
  httpServer.on('request', web.request);

  // bolo ws server
  httpServer.on('upgrade', server.upgrade);

  httpServer.listen(port);
}());
