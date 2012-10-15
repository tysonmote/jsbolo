/* Author: Robert Chrzanowski */

/*jslint
  browser: true, node: true, devel: true, indent: 2*/

/*globals BOLO */

(function () {
  'use strict';

  var i, bolo, json, propertyName,
    terrainArray, terrain,
    enemyPillArray, enemyPill,
    friendlyPillArray, friendlyPill,
    basesArray, base,
    terrainName, properties, length;

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
  bolo.terrainName = {};
  terrainName = bolo.terrainName;

  properties = bolo.properties;

  terrainArray = bolo.terrainArray;
  length = terrainArray.length;
  for (i = 0; i < length; i += 1) {
    terrain = terrainArray[i];
    terrain.id = i;
    terrain.properties = properties[terrain.propertyName];
    terrainName[terrain.name] = terrain;
  }

  enemyPillArray = bolo.enemyPillArray;
  length = enemyPillArray.length;
  for (i = 0; i < length; i += 1) {
    enemyPill = enemyPillArray[i];
    enemyPill.id = i;
    enemyPill.properties = properties[enemyPill.propertyName];
    terrainName[enemyPill.name] = enemyPill;
  }

  friendlyPillArray = bolo.friendlyPillArray;
  length = friendlyPillArray.length;
  for (i = 0; i < length; i += 1) {
    friendlyPill = friendlyPillArray[i];
    friendlyPill.id = i;
    friendlyPill.properties = properties[friendlyPill.propertyName];
    terrainName[friendlyPill.name] = friendlyPill;
  }

  basesArray = bolo.basesArray;
  length = basesArray.length;
  for (i = 0; i < length; i += 1) {
    base = basesArray[i];
    base.id = i;
    base.properties = properties[base.propertyName];
    terrainName[base.name] = base;
  }
}());
