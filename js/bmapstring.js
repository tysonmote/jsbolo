/* Author: Robert Chrzanowski */

/*jslint
  browser: true, node: true, devel: true, indent: 2,
  bitwise: true */

/*globals BOLO */

(function () {
  'use strict';

  var ns, bolo, foo;

  if (typeof window === 'undefined') {
    // we're in node
    ns = exports;
    bolo = require('./bolo.js');

  } else {
    // we're in the browser
    ns = BOLO.bmapString = {};
    bolo = BOLO.bolo;
    foo = BOLO;
  }

  ns.readMapString = function (string) {
    var
      map,
      terrain,
      pills,
      nPills,
      bases,
      nBases,
      starts,
      nStarts,
      left = 255,
      right = 0,
      top = 0,
      bottom = 255,
      test = function (x, y) {
        if (x < left) {
          left = x;
        }
        if (x > right) {
          right = x;
        }
        if (y < bottom) {
          bottom = y;
        }
        if (y > top) {
          top = y;
        }
      },
      owner, armour, speed, shells, mines, dir, n, t,
      offset, i, x, y, start, end, b,
      sea = bolo.terrainName.sea,
      minedSea = bolo.terrainName.minedSea;

    map = {};

    // initialize 2 dimentional array of terrain
    map.terrain = terrain = [];

    for (y = 0; y < bolo.width; y += 1) {
      terrain[y] = [];

      for (x = 0; x < bolo.width; x += 1) {
        if (x < bolo.borderWidth || x >= (bolo.width - bolo.borderWidth) ||
            y < bolo.borderWidth || y >= (bolo.width - bolo.borderWidth)) {
          terrain[y][x] = minedSea;
        } else {
          terrain[y][x] = sea;
        }
      }
    }

    // read number of objects
    offset = 0;

    nPills = string.charCodeAt(offset);
    offset += 1;

    nBases = string.charCodeAt(offset);
    offset += 1;

    nStarts = string.charCodeAt(offset);
    offset += 1;

    // read pills
    map.pills = pills = [];
    for (i = 0; i < nPills; i += 1) {
      x = string.charCodeAt(offset);
      offset += 1;

      y = string.charCodeAt(offset);
      offset += 1;

      owner = string.charCodeAt(offset);
      offset += 1;

      armour = string.charCodeAt(offset);
      offset += 1;

      speed = string.charCodeAt(offset);
      offset += 1;

      pills[i] = {
        x: x,
        y: y,
        owner: owner,
        armour: armour,
        speed: speed
      };
    }

    // write bases
    map.bases = bases = [];
    for (i = 0; i < nBases; i += 1) {
      x = string.charCodeAt(offset);
      offset += 1;

      y = string.charCodeAt(offset);
      offset += 1;

      owner = string.charCodeAt(offset);
      offset += 1;

      armour = string.charCodeAt(offset);
      offset += 1;

      shells = string.charCodeAt(offset);
      offset += 1;

      mines = string.charCodeAt(offset);
      offset += 1;

      bases[i] = {
        x: x,
        y: y,
        owner: owner,
        armour: armour,
        shells: shells,
        mines: mines
      };
    }

    // read in starts
    map.starts = starts = [];
    for (i = 0; i < nStarts; i += 1) {
      x = string.charCodeAt(offset);
      offset += 1;

      y = string.charCodeAt(offset);
      offset += 1;

      dir = string.charCodeAt(offset);
      offset += 1;

      starts[i] = {
        x: x,
        y: y,
        dir: dir
      };
    }

    // read runs of terrain
    for (;;) {
      y = string.charCodeAt(offset);
      offset += 1;

      if (y === 0) {
        break;
      }

      x = string.charCodeAt(offset);
      offset += 1;

      for (;;) {
        n = string.charCodeAt(offset);
        offset += 1;

        if (n === 0) {
          break;
        }

        t = bolo.terrainArray[string.charCodeAt(offset)];
        offset += 1;

        for (i = 0; i < n; i += 1) {
          terrain[y][x] = t;
          x += 1;
        }
      }
    }

    map.centerRect = new foo.Rect(left * 16, bottom * 16,
        (right - left + 1) * 16, (top - bottom + 1) * 16);

    return map;
  };

  ns.saveMapString = function saveMap(map) {
    var
      strings = [],
      length,
      pills = map.pills,
      bases = map.bases,
      starts = map.starts,
      terrain = map.terrain,
      sea = bolo.terrainName.sea,
      minedSea = bolo.terrainName.minedSea,
      fromCharCode = String.fromCharCode,
      i, x, y, start, end, string, b;

    // write number of objects
    strings.push(fromCharCode(pills.length));
    strings.push(fromCharCode(bases.length));
    strings.push(fromCharCode(starts.length));

    // write pills
    length = pills.length;
    for (i = 0; i < length; i += 1) {
      strings.push(fromCharCode(pills[i].x));
      strings.push(fromCharCode(pills[i].y));
      strings.push(fromCharCode(pills[i].owner));
      strings.push(fromCharCode(pills[i].armour));
      strings.push(fromCharCode(pills[i].speed));
    }

    // write bases
    length = bases.length;
    for (i = 0; i < length; i += 1) {
      strings.push(fromCharCode(bases[i].x));
      strings.push(fromCharCode(bases[i].y));
      strings.push(fromCharCode(bases[i].owner));
      strings.push(fromCharCode(bases[i].armour));
      strings.push(fromCharCode(bases[i].shells));
      strings.push(fromCharCode(bases[i].mines));
    }

    // read in starts
    length = starts.length;
    for (i = 0; i < length; i += 1) {
      strings.push(fromCharCode(starts[i].x));
      strings.push(fromCharCode(starts[i].y));
      strings.push(fromCharCode(starts[i].dir));
    }

    // write runs of terrain
    for (y = bolo.borderWidth; y < bolo.width - bolo.borderWidth; y += 1) {
      x = bolo.borderWidth;

      // look for first non sea square
      while (x < bolo.width - bolo.borderWidth) {
        // find a non-sea tile, also shouldn't have mined sea since it only
        // occurs implicitly on the map border
        if (terrain[y][x] === sea) {
          x += 1;
        } else {
          strings.push(fromCharCode(y));
          strings.push(fromCharCode(x));

          // search for end of run from far right
          for (end = bolo.width - bolo.borderWidth; end - 1 > x;
              end -= 1) {
            if (terrain[y][end - 1] !== sea) {
              break;
            }
          }

          start = x;
          b = terrain[y][x];
          x += 1;

          for (;;) {
            if (terrain[y][x] !== b) {
              strings.push(fromCharCode(x - start));
              strings.push(fromCharCode(b.id));
              start = x;
              b = terrain[y][x];

              if (x >= end) {
                break;
              }
            }

            x += 1;
          }

          // end of run
          strings.push(fromCharCode(0));

          break;
        }
      }
    }

    // write final run
    strings.push(fromCharCode(0));

    string = '';

    for (i = 0; i < strings.length; i += 1) {
      string += strings[i];
    }

    //console.log(Buffer.byteLength(string));
    return string;
  };
}());
