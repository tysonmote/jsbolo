/* Author: Robert Chrzanowski */

/*jslint
  node: true, indent: 2 */

(function () {
  'use strict';

  var url, path, fs, fourOhFour, sendFile;

  url = require('url');
  path = require('path');
  fs = require('fs');

  /*
   * sends a 404 response
   */

  fourOhFour = function (response) {
    fs.readFile('404.html', function (err, data) {
      if (err) {
        if (err.code === 'ENOENT') {
          fourOhFour = function (response) {
            response.statusCode = 404;
            response.end();
          };

          fourOhFour(response);

          return;
        }

        throw err;
      }

      fourOhFour = function (response) {
        response.statusCode = 404;
        response.end(data);
      };

      fourOhFour(response);
    });
  };

  /*
   * reads a file asyncronously and sends it as a response, keeps a copy
   * in memory for further requests
   */

  sendFile = (function () {
    var cache = {};

    return function (pathname, response) {
      pathname = path.join('.', pathname);

      if (cache[pathname] === undefined) {
        fs.readFile(pathname, function (err, data) {
          if (err) {
            // if the file doesn't exist, send a 404
            if (err.code === 'ENOENT') {
              fourOhFour(response);
              return;
            }

            throw err;
          }

          cache[pathname] = data;
          response.write(data);
          response.end();
        });

      } else {
        response.write(cache[pathname]);
        response.end();
      }
    };
  }());

  exports.request = function (request, response) {
    var hdr, pathname, dirname, sep, basename, extname;

    hdr = url.parse(request.url);

    switch (request.method) {
    case 'GET':
      pathname = path.normalize(hdr.pathname);
      dirname = path.dirname(pathname);
      sep = pathname.split('/');
      basename = path.basename(pathname);
      extname = path.extname(pathname);

      if (dirname === '/') {  // root
        if (basename === '') {
          response.setHeader('Content-Type', 'text/html');
          sendFile('index.html', response);

        } else if (basename === 'favicon.ico') {
          response.setHeader('Content-Type', 'image/x-icon');
          sendFile(pathname, response);

        } else {
          fourOhFour(response);
        }

      } else if (dirname === '/css') {  // css
        if (extname === '.css') {
          response.setHeader('Content-Type', 'text/css');
          sendFile(pathname, response);

        } else {
          fourOhFour(response);
        }

      } else if (dirname === '/img') {  // img
        if (extname === '.png') {
          response.setHeader('Content-Type', 'image/png');
          sendFile(pathname, response);

        } else {
          fourOhFour(response);
        }

      } else if (dirname === '/data') {  // data
        if (extname === '.json') {
          response.setHeader('Content-Type', 'text/json');
          sendFile(pathname, response);

        } else {
          fourOhFour(response);
        }

      } else if (sep[1] === 'js') {  // js
        if (extname === '.js') {
          response.setHeader('Content-Type', 'text/javascript');
          sendFile(pathname, response);

        } else {
          fourOhFour(response);
        }

      } else {
        fourOhFour(response);
      }

      break;

    case 'POST':
      fourOhFour(response);

      break;

    default:
      fourOhFour(response);

      break;
    }
  };
}());
