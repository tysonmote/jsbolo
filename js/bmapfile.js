/* Author: Robert Chrzanowski */

/*jslint
  node: true, devel: true, indent: 2,
  bitwise: true */

(function () {
  'use strict';

  var bolo, ident = 'BMAPBOLO', version = 1;

  bolo = require('./bolo.js');

  exports.loadMap = function loadMap(data) {
    var i, x, y, offset, assert,
      nPills, nBases, nStarts, owner, armour, speed, shells, mines, dir,
      endx, terrain, nibble, len, dataLen, map,
      dataLength = data.length;

    assert = true;
    map = {};

    // initialize 2 dimentional array of terrain
    map.terrain = [];

    for (y = 0; y < bolo.width; y += 1) {
      map.terrain.push([]);

      for (x = 0; x < bolo.width; x += 1) {
        if (x < bolo.borderWidth || x >= (bolo.width - bolo.borderWidth) ||
            y < bolo.borderWidth || y >= (bolo.width - bolo.borderWidth)) {
          map.terrain[y].push(bolo.terrainName.minedSea);
        } else {
          map.terrain[y].push(bolo.terrainName.sea);
        }
      }
    }

    // verify signature
    for (offset = 0; offset < ident.length; offset += 1) {
      if (ident.charCodeAt(offset) !== data[offset]) {
        // not a bmap file
        console.log('Not a BMAP File');
        return;
      }
    }

    // read version
    if (version !== data.readUInt8(offset, assert)) {
      console.log('Cannot open map version (%d)\n',
        data.readUInt8(offset, assert));
      return;
    }

    offset += 1;

    // read number of objects
    nPills = data.readUInt8(offset, assert);
    offset += 1;

    nBases = data.readUInt8(offset, assert);
    offset += 1;

    nStarts = data.readUInt8(offset, assert);
    offset += 1;

    // read in pills
    map.pills = [];
    for (i = 0; i < nPills; i += 1) {
      x = data.readUInt8(offset, assert);
      offset += 1;

      y = data.readUInt8(offset, assert);
      offset += 1;

      owner = data.readUInt8(offset, assert);
      offset += 1;

      armour = data.readUInt8(offset, assert);
      offset += 1;

      speed = data.readUInt8(offset, assert);
      offset += 1;

      map.pills[i] = {
        x: x,
        y: y,
        owner: owner,
        armour: armour,
        speed: speed
      };
    }

    // read in bases
    map.bases = [];
    for (i = 0; i < nBases; i += 1) {
      x = data.readUInt8(offset, assert);
      offset += 1;

      y = data.readUInt8(offset, assert);
      offset += 1;

      owner = data.readUInt8(offset, assert);
      offset += 1;

      armour = data.readUInt8(offset, assert);
      offset += 1;

      shells = data.readUInt8(offset, assert);
      offset += 1;

      mines = data.readUInt8(offset, assert);
      offset += 1;

      map.bases[i] = {
        x: x,
        y: y,
        owner: owner,
        armour: armour,
        shells: shells,
        mines: mines
      };
    }

    // read in starts
    map.starts = [];
    for (i = 0; i < nStarts; i += 1) {
      x = data.readUInt8(offset, assert);
      offset += 1;

      y = data.readUInt8(offset, assert);
      offset += 1;

      dir = data.readUInt8(offset, assert);
      offset += 1;

      map.starts[i] = {
        x: x,
        y: y,
        dir: dir
      };
    }

    // crockford forgive me
    // takes a byte from data and returns the first nibble the first call
    // returns the second nibble the second call and repeats
    function bite() {
      var chew;

      chew = data.readUInt8(offset, assert);
      offset += 1;

      nibble = function () {
        nibble = bite;
        return chew & 0x0f;
      };

      return (chew & 0xf0) >>> 4;
    }

    while (offset + 4 < dataLength) {  // read in terrain
      dataLen = data.readUInt8(offset, assert);
      offset += 1;

      y = data.readUInt8(offset, assert);
      offset += 1;

      x = data.readUInt8(offset, assert);
      offset += 1;

      endx = data.readUInt8(offset, assert);
      offset += 1;

      // if last run
      if (dataLen === 4 && y === 0xff && x === 0xff && endx === 0xff) {
        break;
      }

      nibble = bite;

      while (x < endx) {
        len = nibble();

        // 0-7 is a sequence of 1-8 different tiles
        if (len >= 0 && len <= 7) {
          len += 1;

          for (i = 0; i < len; i += 1) {
            map.terrain[y][x] = bolo.terrainArray[nibble()];
            x += 1;
          }
        } else if (len >= 8 && len <= 15) {
          // 8-15 is a sequence of 2-9 same tiles
          len -= 6;
          terrain = bolo.terrainArray[nibble()];

          for (i = 0; i < len; i += 1) {
            map.terrain[y][x] = terrain;
            x += 1;
          }
        }
      }
    }

    return map;
  };

  exports.saveMap = function saveMap(map) {
    var i, x, y, offset, startx, assert = true,
      nibble, data, runHeader, b;

    /*preambleSize = 12;
    pillSize = 5;
    baseSize = 6;
    startSize = 3;
    runSize = 4;

    // this isn't quite right but it's pretty large and should handle most maps
    maxSize = Math.pow(width - (2 * border), 2) * (runSize + 1) +
      (pillSize + baseSize + startSize) * 255 + preambleSize;*/

    // large enough buffer to do our work
    data = new Buffer(142826);

    // write signature
    for (offset = 0; offset < ident.length; offset += 1) {
      data.writeUInt8(ident.charCodeAt(offset), offset, assert);
    }

    // write version
    data.writeUInt8(version, offset, assert);
    offset += 1;

    // write number of objects
    data.writeUInt8(map.pills.length, offset, assert);
    offset += 1;

    data.writeUInt8(map.bases.length, offset, assert);
    offset += 1;

    data.writeUInt8(map.starts.length, offset, assert);
    offset += 1;

    // write pills
    for (i = 0; i < map.pills.length; i += 1) {
      data.writeUInt8(map.pills[i].x, offset, assert);
      offset += 1;

      data.writeUInt8(map.pills[i].y, offset, assert);
      offset += 1;

      data.writeUInt8(map.pills[i].owner, offset, assert);
      offset += 1;

      data.writeUInt8(map.pills[i].armour, offset, assert);
      offset += 1;

      data.writeUInt8(map.pills[i].speed, offset, assert);
      offset += 1;
    }

    // write bases
    for (i = 0; i < map.bases.length; i += 1) {
      data.writeUInt8(map.bases[i].x, offset, assert);
      offset += 1;

      data.writeUInt8(map.bases[i].y, offset, assert);
      offset += 1;

      data.writeUInt8(map.bases[i].owner, offset, assert);
      offset += 1;

      data.writeUInt8(map.bases[i].armour, offset, assert);
      offset += 1;

      data.writeUInt8(map.bases[i].shells, offset, assert);
      offset += 1;

      data.writeUInt8(map.bases[i].mines, offset, assert);
      offset += 1;
    }

    // read in starts
    for (i = 0; i < map.starts.length; i += 1) {
      data.writeUInt8(map.starts[i].x, offset, assert);
      offset += 1;

      data.writeUInt8(map.starts[i].y, offset, assert);
      offset += 1;

      data.writeUInt8(map.starts[i].dir, offset, assert);
      offset += 1;
    }

    function bite(nib1) {
      data.writeUInt8(nib1 << 4, offset, assert);
      offset += 1;

      nibble = function (nib2) {
        data.writeUInt8(((nib1 << 4) & 0xf0) | (nib2 & 0x0f), offset - 1,
          assert);
        nibble = bite;
      };
    }

    // write runs of terrain
    for (y = bolo.borderWidth; y < bolo.width - bolo.borderWidth; y += 1) {
      x = bolo.borderWidth;

      // look for first non sea square
      while (x < bolo.width - bolo.borderWidth) {
        // find a non-sea tile, also shouldn't have mined sea since it only
        // occurs implicatly on the map border
        if (map.terrain[y][x] === bolo.terrainName.sea) {
          x += 1;
        } else {
          // now we can encode this run of terrain 
          startx = x;

          // skip over run header for now
          runHeader = offset;
          offset += 4;

          // write one nibble at a time
          nibble = bite;

          // loop through the different kinds of runs
          for (;;) {
            b = x;

            // if two or more terrain tiles are the same use rle
            if (x + 1 < bolo.width - bolo.borderWidth && // on edge
                map.terrain[y][x] === map.terrain[y][x + 1]) {

              // already know 2 squares are the same
              x += 2;

              // get up to 8 same tiles
              for (;;) {
                // end of run
                if (x >= bolo.width - bolo.borderWidth ||
                    map.terrain[y][x] === bolo.terrainName.sea ||
                    // end of pattern
                    map.terrain[y][x] !== map.terrain[y][b] ||
                    x - b > 8) {

                  break;
                }

                x += 1;
              }

              // write length - 1
              // 2-9 squares becomes 8-15 encoded
              nibble(x - b + 6);

              // write terrain id
              nibble(map.terrain[y][b].id);
            } else {  // these are a series of different terrain squares
              // we know that we have at least one square of different squares
              x += 1;

              // find how many squares we have that are not sea
              for (;;) {
                // end of run
                if (x >= bolo.width - bolo.borderWidth ||
                    map.terrain[y][x] === bolo.terrainName.sea ||
                    // end of pattern
                    map.terrain[y][x] === map.terrain[y][x + 1] ||
                    x - b > 7) {

                  break;
                }

                x += 1;
              }

              // write length + 6
              // 1-8 squares becomes 0-7 encoded
              nibble(x - b - 1);

              while (b < x) {
                nibble(map.terrain[y][b].id);
                b += 1;
              }
            }

            // end of run
            if (x >= bolo.width - bolo.borderWidth ||
                map.terrain[y][x] === bolo.terrainName.sea) {
              break;
            }
          }

          // write run header
          data.writeUInt8(offset - runHeader, runHeader,
            assert);
          runHeader += 1;

          data.writeUInt8(y, runHeader, assert);
          runHeader += 1;

          data.writeUInt8(startx, runHeader, assert);
          runHeader += 1;

          data.writeUInt8(x, runHeader, assert);
          runHeader += 1;  // not needed but kept for posterity
        }
      }
    }

    // write final run
    data.writeUInt8(4, offset, assert);
    offset += 1;

    data.writeUInt8(0xff, offset, assert);
    offset += 1;

    data.writeUInt8(0xff, offset, assert);
    offset += 1;

    data.writeUInt8(0xff, offset, assert);
    offset += 1;

    return data.slice(0, offset);
  };
}());
