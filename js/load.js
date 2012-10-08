/* Author: Robert Chrzanowski */

/*jslint
  browser: true, node: true, devel: true, indent: 2*/
  /*sloppy: true, evil: true*/

/*globals BOLO, yepnope, Modernizr */

// create our namespace
var BOLO = {};

(function () {
  'use strict';

  var ns, assets, json, scripts;

  ns = BOLO;

  assets = [
    // art assets
    'img!img/tiles.png',
    'img!img/sprites.png'
  ];

  json = [
    'json!data/bolo.json',
    'json!data/messages.json'
  ];

  scripts = [
    // libraries
    //'js/libs/jquery-1.7.2.min.js',

    // script files
    'js/bolo.js',
    'js/boloview.js',
    'js/bmap.js',
    'js/rect.js',
    'js/tilemap.js',
    'js/client.js',
    'js/clientui.js',
    'js/debug.js',
    'js/parse.js',
    'js/vector.js'
  ];

  // contains all our images keyed by name
  ns.images = {};

  // contains all json data keyed by filename
  ns.json = {};

  yepnope.addPrefix('img', function (resource) {
    resource.noexec = true;

    resource.instead = function (input, callback) {
      var image, name, src;

      image = new Image();
      src = input.substr(input.lastIndexOf('!') + 1);
      name = input.substring(input.lastIndexOf('/') + 1,
          input.lastIndexOf('.'));

      image.onload = function () {
        if (ns.images[name] === undefined) {
          ns.images[name] = image;
        }

        callback();
      };

      image.onerror = function () {
        console.log('failed');
        callback();
      };

      image.src = src;
    };

    return resource;
  });

  yepnope.addPrefix('json', function (resource) {
    resource.noexec = true;

    resource.instead = function (input, callback) {
      var req = new XMLHttpRequest(), src, name;

      src = input.substr(input.lastIndexOf('!') + 1);
      name = input.substring(input.lastIndexOf('/') + 1,
          input.lastIndexOf('.'));

      req.onload = function (data) {
        if (ns.json[name] === undefined) {
          ns.json[name] = JSON.parse(data.target.responseText);
        }

        callback();
      };

      req.onerror = function () {
        console.log('failed');
        callback();
      };

      req.open('GET', src, true);
      req.send();
    };

    return resource;
  });

  /*yepnope.addPrefix('js', function (resource) {
    resource.noexec = true;

    resource.instead = function (input, callback) {
      var req = new XMLHttpRequest(), src;

      src = input.substr(input.lastIndexOf('!') + 1);

      req.onload = function (data) {
        eval(data.target.responseText);
        callback();
      };

      req.onerror = function () {
        console.log('failed');
        callback();
      };

      req.open('GET', src, true);
      req.send();
    };

    return resource;
  });*/

  // load art assets
  Modernizr.load({
    load: assets
  });

  // load json before scripts
  Modernizr.load({
    load: json,
    complete: function () {
      Modernizr.load({
        load: scripts,
        complete: function () {
          ns.client.init();
        }
      });
    }
  });
}());
