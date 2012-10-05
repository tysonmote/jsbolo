/* Author: Robert Chrzanowski */

/*jslint
  browser: true, node: true, devel: true, indent: 2*/

/*globals BOLO */

(function () {
  'use strict';

  var i, bolo, json, propertyName, terrainProperties, terrainArray,
    terrainName, length, t;

  if (typeof window === 'undefined') {
    // we're in node
    bolo = exports;
    json = require('../data/bolo.json');

  } else {
    // we're in the browser
    BOLO.bolo = {};
    bolo = BOLO.bolo;
    json = BOLO.json.bolo;
  }

  // copies references json to bolo
  for (propertyName in json) {
    if (json.hasOwnProperty(propertyName)) {
      bolo[propertyName] = json[propertyName];
    }
  }

  // dereference terrain properties in bolo object and map names to terrain
  // in terrainName
  terrainProperties = bolo.terrainProperties;
  terrainArray = bolo.terrainArray;
  length = terrainArray.length;
  bolo.terrainName = {};
  terrainName = bolo.terrainName;

  for (i = 0; i < length; i += 1) {
    t = terrainArray[i];
    t.id = i;
    t.properties = terrainProperties[t.propertyName];
    terrainName[t.name] = t;
  }
}());
