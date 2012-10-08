/* Author: Robert Chrzanowski */

/*jslint
  browser: true, node: true, devel: true, indent: 2,
  bitwise: true */

/*globals BOLO */

(function () {
  'use strict';

  var ns, ls, BMap,
    ident = 'BMAPBOLO', version = 1;

  if (typeof window === 'undefined') {
    // we're in node
    ns = exports;
    ls = {
      bolo: require('./bolo.js'),
      Rect: require('./rect.js').Rect
    };

  } else {
    // we're in a browser
    ns = ls = window.BOLO;
  }

  ns.BMap = BMap = (function () {
    var prototype = {
      constructor: function () {
        var
          bmap = Object.create(prototype),
          terrain = [],
          width = ls.bolo.width,
          borderWidth = ls.bolo.borderWidth,
          max = width - borderWidth,
          sea = ls.bolo.terrainName.sea,
          minedSea = ls.bolo.terrainName.minedSea,
          x, y;

        bmap.terrain = terrain;

        for (y = 0; y < width; y += 1) {
          terrain[y] = [];

          for (x = 0; x < width; x += 1) {
            if (x < borderWidth || x >= max ||
                y < borderWidth || y >= max) {
              terrain[y][x] = minedSea;
            } else {
              terrain[y][x] = sea;
            }
          }
        }

        bmap.pills = [];
        bmap.bases = [];
        bmap.starts = [];
        bmap.centerRect = ls.bolo.worldRect;

        return bmap;
      },

      toString: function () {
        var
          strings = [],
          length,
          pills = this.pills,
          bases = this.bases,
          starts = this.starts,
          terrain = this.terrain,
          sea = ls.bolo.terrainName.sea,
          minedSea = ls.bolo.terrainName.minedSea,
          fromCharCode = String.fromCharCode,
          width = ls.bolo.width,
          borderWidth = ls.bolo.borderWidth,
          max = width - borderWidth,
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
        for (y = borderWidth; y < max; y += 1) {
          x = borderWidth;

          // look for first non sea square
          while (x < max) {
            // find a non-sea tile, also shouldn't have mined sea since it only
            // occurs implicitly on the map border
            if (terrain[y][x] === sea) {
              x += 1;
            } else {
              strings.push(fromCharCode(y));
              strings.push(fromCharCode(x));

              // search for end of run from far right
              for (end = max; end - 1 > x;
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

        return string;
      },

      toBuffer: function () {
        var i, x, y, offset, startx,
          nibble, data, runHeader, b,
          pills, bases, starts, terrain,
          sea = ls.bolo.terrainName.sea,
          borderWidth = ls.bolo.borderWidth,
          max = ls.bolo.width - borderWidth,
          assert = true;

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
        pills = this.pills;
        data.writeUInt8(pills.length, offset, assert);
        offset += 1;

        bases = this.bases;
        data.writeUInt8(bases.length, offset, assert);
        offset += 1;

        starts = this.starts;
        data.writeUInt8(starts.length, offset, assert);
        offset += 1;

        // write pills
        for (i = 0; i < pills.length; i += 1) {
          data.writeUInt8(pills[i].x, offset, assert);
          offset += 1;

          data.writeUInt8(pills[i].y, offset, assert);
          offset += 1;

          data.writeUInt8(pills[i].owner, offset, assert);
          offset += 1;

          data.writeUInt8(pills[i].armour, offset, assert);
          offset += 1;

          data.writeUInt8(pills[i].speed, offset, assert);
          offset += 1;
        }

        // write bases
        for (i = 0; i < bases.length; i += 1) {
          data.writeUInt8(bases[i].x, offset, assert);
          offset += 1;

          data.writeUInt8(bases[i].y, offset, assert);
          offset += 1;

          data.writeUInt8(bases[i].owner, offset, assert);
          offset += 1;

          data.writeUInt8(bases[i].armour, offset, assert);
          offset += 1;

          data.writeUInt8(bases[i].shells, offset, assert);
          offset += 1;

          data.writeUInt8(bases[i].mines, offset, assert);
          offset += 1;
        }

        // read in starts
        for (i = 0; i < starts.length; i += 1) {
          data.writeUInt8(starts[i].x, offset, assert);
          offset += 1;

          data.writeUInt8(starts[i].y, offset, assert);
          offset += 1;

          data.writeUInt8(starts[i].dir, offset, assert);
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
        terrain = this.terrain;
        for (y = borderWidth; y < max; y += 1) {
          x = borderWidth;

          // look for first non sea square
          while (x < max) {
            // find a non-sea tile, also shouldn't have mined sea since it only
            // occurs implicatly on the map border
            if (terrain[y][x] === sea) {
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
                if (x + 1 < max && // on edge
                    terrain[y][x] === terrain[y][x + 1]) {

                  // already know 2 squares are the same
                  x += 2;

                  // get up to 8 same tiles
                  for (;;) {
                    // end of run
                    if (x >= max || terrain[y][x] === sea ||
                        // end of pattern
                        terrain[y][x] !== terrain[y][b] ||
                        x - b > 8) {

                      break;
                    }

                    x += 1;
                  }

                  // write length - 1
                  // 2-9 squares becomes 8-15 encoded
                  nibble(x - b + 6);

                  // write terrain id
                  nibble(terrain[y][b].id);
                } else {
                  // these are a series of different terrain squares we know
                  // that we have at least one square of different squares
                  x += 1;

                  // find how many squares we have that are not sea
                  for (;;) {
                    // end of run
                    if (x >= max || terrain[y][x] === sea ||
                        // end of pattern
                        terrain[y][x] === terrain[y][x + 1] ||
                        x - b > 7) {

                      break;
                    }

                    x += 1;
                  }

                  // write length + 6
                  // 1-8 squares becomes 0-7 encoded
                  nibble(x - b - 1);

                  while (b < x) {
                    nibble(terrain[y][b].id);
                    b += 1;
                  }
                }

                // end of run
                if (x >= max || terrain[y][x] === sea) {
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
      },

      draw: function (canvas) {
        var
          ctx = canvas.getContext('2d'),
          width = canvas.width,
          height = canvas.height,
          terrain = this.terrain,
          rect = this.centerRect.intersect(ls.bolo.worldRect),
          rectX = rect.x,
          rectY = rect.y,
          rectWidth = rect.width,
          rectHeight = rect.height,
          x,
          y,
          xMax = rectX + rect.width,
          yMax = rectY + rect.height,
          drawObjects,
          row, dx, dy, widthCeil, obj;

        // clears to match sea
        ctx.fillStyle = ls.bolo.terrainName.sea.properties.color;
        ctx.fillRect(0, 0, width, height);

        if ((width / height) > (rectWidth / rectHeight)) {
          // height bound
          height /= rectHeight;
          dx = (width - (height * rectWidth)) / 2;
          dy = 0;
          width = height;

        } else {
          // width bound
          width /= rectWidth;
          dx = 0;
          dy = (height - (width * rectHeight)) / 2;
          //height = width;
        }

        widthCeil = Math.ceil(width);

        for (y = rectY; y < yMax; y += 1) {
          row = terrain[y];

          for (x = rectX; x < xMax; x += 1) {
            ctx.fillStyle = row[x].properties.color;

            ctx.fillRect(
              Math.round(dx + ((x - rectX) * width)),
              Math.round(dy + ((y - rectY) * width)),
              widthCeil,
              widthCeil
            );
          }
        }

        // draw objects
        drawObjects = function (objects) {
          var i, object, nObjects, x, y, xx, yy;

          nObjects = objects.length;
          for (i = 0; i < nObjects; i += 1) {
            object = objects[i];

            x = dx + ((object.x - rectX) * width);
            y = dy + ((object.y - rectY) * width);
            xx = Math.round(x + width);
            yy = Math.round(y + width);
            x = Math.round(x);
            y = Math.round(y);

            ctx.fillRect(x, y, xx - x, yy - y);
          }
        };

        ctx.fillStyle = '#808080';
        drawObjects(this.starts);

        ctx.fillStyle = '#ffff00';
        drawObjects(this.bases);

        ctx.fillStyle = '#ff0000';
        drawObjects(this.pills);
      },

      findObject: function (x, y) {
        var pills, nPills, bases, nBases, starts, nStarts, i, obj;

        pills = this.pills;
        nPills = pills.length;
        for (i = 0; i < nPills; i += 1) {
          obj = pills[i];

          if (obj.x === x && obj.y === y) {
            return obj;
          }
        }

        bases = this.bases;
        nBases = bases.length;
        for (i = 0; i < nBases; i += 1) {
          obj = bases[i];

          if (obj.x === x && obj.y === y) {
            return obj;
          }
        }

        starts = this.starts;
        nStarts = starts.length;
        for (i = 0; i < nStarts; i += 1) {
          obj = starts[i];

          if (obj.x === x && obj.y === y) {
            return obj;
          }
        }

        return null;
      }
    };

    prototype.constructor.fromData = function (data) {
      var i, x, y, offset, assert,
        pills, nPills, bases, nBases, starts, nStarts, terrain,
        owner, armour, speed, shells, mines, dir,
        endx, terrainType, nibble, len, dataLen, bmap,
        dataLength = data.length,
        terrainArray = ls.bolo.terrainArray,
        left = 255,
        right = 0,
        top = 0,
        bottom = 255,
        testRange = function (x, y) {
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
        };

      bmap = new BMap();

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
      pills = bmap.pills;
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

        pills.push({
          x: x,
          y: y,
          owner: owner,
          armour: armour,
          speed: speed,
          color: '#ff0000'
        });

        testRange(x, y);
      }

      // read in bases
      bases = bmap.bases;
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

        bases.push({
          x: x,
          y: y,
          owner: owner,
          armour: armour,
          shells: shells,
          mines: mines,
          color: '#ffff00'
        });

        testRange(x, y);
      }

      // read in starts
      starts = bmap.starts;
      for (i = 0; i < nStarts; i += 1) {
        x = data.readUInt8(offset, assert);
        offset += 1;

        y = data.readUInt8(offset, assert);
        offset += 1;

        dir = data.readUInt8(offset, assert);
        offset += 1;

        starts.push({
          x: x,
          y: y,
          dir: dir,
          color: '#333333'
        });

        testRange(x, y);
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

      terrain = bmap.terrain;
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

        testRange(x, y);

        nibble = bite;

        while (x < endx) {
          len = nibble();

          // 0-7 is a sequence of 1-8 different tiles
          if (len >= 0 && len <= 7) {
            len += 1;

            for (i = 0; i < len; i += 1) {
              terrain[y][x] = terrainArray[nibble()];
              x += 1;
            }
          } else if (len >= 8 && len <= 15) {
            // 8-15 is a sequence of 2-9 same tiles
            len -= 6;
            terrainType = terrainArray[nibble()];

            for (i = 0; i < len; i += 1) {
              terrain[y][x] = terrainType;
              x += 1;
            }
          }

          testRange(x - 1, y);
        }
      }

      bmap.centerRect = new ls.Rect(
        left,
        bottom,
        right - left + 1,
        top - bottom + 1
      );

      return bmap;
    };

    prototype.constructor.fromString = function (string) {
      var
        bmap = new BMap(),
        pills,
        nPills,
        bases,
        nBases,
        starts,
        nStarts,
        terrain,
        owner, armour, speed, shells, mines, dir, n, t,
        i, x, y, start, end, b,
        terrainArray = ls.bolo.terrainArray,
        offset = 0,
        left = 255,
        right = 0,
        top = 0,
        bottom = 255,
        testRange = function (x, y) {
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
        };

      // read number of objects
      nPills = string.charCodeAt(offset);
      offset += 1;

      nBases = string.charCodeAt(offset);
      offset += 1;

      nStarts = string.charCodeAt(offset);
      offset += 1;

      // read pills
      pills = bmap.pills;
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
          speed: speed,
          color: '#ff0000'
        };

        testRange(x, y);
      }

      // write bases
      bases = bmap.bases;
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
          mines: mines,
          color: '#ff0000'
        };

        testRange(x, y);
      }

      // read in starts
      starts = bmap.starts;
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
          dir: dir,
          color: '#ff0000'
        };

        testRange(x, y);
      }

      // read runs of terrain
      terrain = bmap.terrain;
      for (;;) {
        y = string.charCodeAt(offset);
        offset += 1;

        if (y === 0) {
          break;
        }

        x = string.charCodeAt(offset);
        offset += 1;

        testRange(x, y);

        for (;;) {
          n = string.charCodeAt(offset);
          offset += 1;

          if (n === 0) {
            break;
          }

          t = terrainArray[string.charCodeAt(offset)];
          offset += 1;

          for (i = 0; i < n; i += 1) {
            terrain[y][x] = t;
            x += 1;
          }
        }

        testRange(x - 1, y);
      }

      bmap.centerRect = new ls.Rect(
        left,
        bottom,
        right - left + 1,
        top - bottom + 1
      );

      return bmap;
    };

    return prototype.constructor;
  }());
}());
