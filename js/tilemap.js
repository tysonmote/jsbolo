/* Author: Robert Chrzanowski */

/*jslint
  browser: true, devel: true, indent: 2, bitwise: true */

/*globals BOLO */

(function (ns) {
  'use strict';

  var
    Tile,
    TileMap;

  Tile = (function () {
    var prototype = {
      constructor: function (x, y) {
        var tile = Object.create(prototype);

        tile.x = x;
        tile.y = y;

        return tile;
      }
    };

    return prototype.constructor;
  }());

  ns.TileMap = TileMap = (function () {
    var prototype = {
      constructor: function (gameData) {
        var
          tileMap,
          x, y, width, map, tiles, row,
          pills, nPills, pill, bases, nBases, base, i;

        tileMap = Object.create(prototype);
        tileMap.pills = pills = gameData.pills;
        tileMap.bases = bases = gameData.bases;
        tileMap.map = map = [];
        tileMap.tiles = tiles = [];

        width = ns.bolo.width;

        // initializes map and tiles
        for (y = 0; y < width; y += 1) {
          tiles[y] = [];
          map[y] = row = [];
          for (x = 0; x < width; x += 1) {
            row[x] = gameData.terrain[y][x];
          }
        }

        nBases = bases.length;
        for (i = 0; i < nBases; i += 1) {
          base = bases[i];
          x = base.x;
          y = base.y;
          if (base.owner === 0xff) {
            map[y][x] = ns.bolo.terrainName.neutralBase;
          } else {
            map[y][x] = ns.bolo.terrainName.enemyBase;
          }
        }

        nPills = pills.length;
        for (i = 0; i < nPills; i += 1) {
          pill = pills[i];
          x = pill.x;
          y = pill.y;
          map[y][x] = ns.bolo.terrainName.enemyPill15;
        }

        // refreshes tiles
        tileMap.refreshRect(ns.Rect(0, 0, width, width));

        return tileMap;
      },

      refreshTile: (function () {
        // closure contains all tile objects
        var
          enemyPillTiles = [
            new Tile(0, 0),
            new Tile(1, 0),
            new Tile(2, 0),
            new Tile(3, 0),
            new Tile(4, 0),
            new Tile(5, 0),
            new Tile(6, 0),
            new Tile(7, 0),
            new Tile(8, 0),
            new Tile(9, 0),
            new Tile(10, 0),
            new Tile(11, 0),
            new Tile(12, 0),
            new Tile(13, 0),
            new Tile(14, 0),
            new Tile(15, 0)
          ],
          friendlyPillTiles = [
            new Tile(0, 1),
            new Tile(1, 1),
            new Tile(2, 1),
            new Tile(3, 1),
            new Tile(4, 1),
            new Tile(5, 1),
            new Tile(6, 1),
            new Tile(7, 1),
            new Tile(8, 1),
            new Tile(9, 1),
            new Tile(10, 1),
            new Tile(11, 1),
            new Tile(12, 1),
            new Tile(13, 1),
            new Tile(14, 1),
            new Tile(15, 1)
          ],
          baseTiles = [
            new Tile(12, 2),
            new Tile(13, 2),
            new Tile(14, 2)
          ],
          wallTiles = [
            new Tile(0,  7),
            new Tile(1,  7),
            new Tile(2,  7),
            new Tile(3,  7),
            new Tile(4,  7),
            new Tile(5,  7),
            new Tile(6,  7),
            new Tile(7,  7),
            new Tile(8,  7),
            new Tile(9,  7),
            new Tile(10, 7),
            new Tile(0,  8),
            new Tile(1,  8),
            new Tile(2,  8),
            new Tile(3,  8),
            new Tile(4,  8),
            new Tile(5,  8),
            new Tile(6,  8),
            new Tile(7,  8),
            new Tile(8,  8),
            new Tile(9,  8),
            new Tile(10, 8),
            new Tile(11, 8),
            new Tile(0,  9),
            new Tile(1,  9),
            new Tile(2,  9),
            new Tile(3,  9),
            new Tile(4,  9),
            new Tile(5,  9),
            new Tile(6,  9),
            new Tile(7,  9),
            new Tile(8,  9),
            new Tile(9,  9),
            new Tile(10, 9),
            new Tile(11, 9),
            new Tile(0,  10),
            new Tile(1,  10),
            new Tile(2,  10),
            new Tile(3,  10),
            new Tile(4,  10),
            new Tile(5,  10),
            new Tile(6,  10),
            new Tile(7,  10),
            new Tile(8,  10),
            new Tile(9,  10),
            new Tile(10, 10),
            new Tile(11, 10)
          ],
          riverTiles = [
            new Tile(12,  7),
            new Tile(13,  7),
            new Tile(14,  7),
            new Tile(15,  7),
            new Tile(12,  8),
            new Tile(13,  8),
            new Tile(14,  8),
            new Tile(15,  8),
            new Tile(12,  9),
            new Tile(13,  9),
            new Tile(14,  9),
            new Tile(15,  9),
            new Tile(12, 10),
            new Tile(13, 10),
            new Tile(14, 10),
            new Tile(15, 10)
          ],
          swampTiles = [
            new Tile(9, 2)
          ],
          craterTiles = [
            new Tile(12, 3),
            new Tile(13, 3),
            new Tile(14, 3),
            new Tile(15, 3),
            new Tile(12, 4),
            new Tile(13, 4),
            new Tile(14, 4),
            new Tile(15, 4),
            new Tile(12, 5),
            new Tile(13, 5),
            new Tile(14, 5),
            new Tile(15, 5),
            new Tile(12, 6),
            new Tile(13, 6),
            new Tile(14, 6),
            new Tile(15, 6)
          ],
          roadTiles = [
            new Tile(15, 2),

            new Tile(0,  3),
            new Tile(1,  3),
            new Tile(2,  3),
            new Tile(3,  3),
            new Tile(4,  3),
            new Tile(5,  3),
            new Tile(6,  3),
            new Tile(7,  3),
            new Tile(8,  3),
            new Tile(9,  3),
            new Tile(10, 3),
            new Tile(11, 3),

            new Tile(0, 4),
            new Tile(1, 4),
            new Tile(2, 4),
            new Tile(3, 4),
            new Tile(4, 4),
            new Tile(5, 4),

            new Tile(0, 5),
            new Tile(1, 5),
            new Tile(2, 5),
            new Tile(3, 5),
            new Tile(4, 5),
            new Tile(5, 5),

            new Tile(0, 6),
            new Tile(1, 6),
            new Tile(2, 6),
            new Tile(3, 6),
            new Tile(4, 6),
            new Tile(5, 6)
          ],
          forestTiles = [
            new Tile(9,  4),
            new Tile(10, 4),
            new Tile(11, 4),
            new Tile(9,  5),
            new Tile(10, 5),
            new Tile(11, 5),
            new Tile(9,  6),
            new Tile(10, 6),
            new Tile(11, 6),
            new Tile(11, 7)
          ],
          rubbleTiles = [
            new Tile(10, 2)
          ],
          grassTiles = [
            new Tile(8, 2)
          ],
          damagedWallTiles = [
            new Tile(11, 2)
          ],
          boatTiles = [
            new Tile(0, 2),
            new Tile(1, 2),
            new Tile(2, 2),
            new Tile(3, 2),
            new Tile(4, 2),
            new Tile(5, 2),
            new Tile(6, 2),
            new Tile(7, 2)
          ],
          seaTiles = [
            new Tile(6, 4),
            new Tile(7, 4),
            new Tile(8, 4),
            new Tile(6, 5),
            new Tile(7, 5),
            new Tile(8, 5),
            new Tile(6, 6),
            new Tile(7, 6),
            new Tile(8, 6)
          ];

        // return mapping function to tile objects
        return function (x, y) {
          var
            terrainName = ns.bolo.terrainName,
            map = this.map, seaProperties = terrainName.sea.properties,
            left =   x > 0   ? map[y][x - 1].properties : seaProperties,
            right =  x < 255 ? map[y][x + 1].properties : seaProperties,
            bottom = y < 255 ? map[y + 1][x].properties : seaProperties,
            top =    y > 0   ? map[y - 1][x].properties : seaProperties,
            lftbot, rghbot, lfttop, rghtop,
            tile, properties, num, index,
            wall = terrainName.wall.properties,
            river = terrainName.river.properties,
            swamp = terrainName.swamp.properties,
            crater = terrainName.crater.properties,
            road = terrainName.road.properties,
            forest = terrainName.forest.properties,
            rubble = terrainName.rubble.properties,
            grass = terrainName.grass.properties,
            damagedWall = terrainName.damagedWall.properties,
            boat = terrainName.boat.properties,
            sea = terrainName.sea.properties,

            deadEnemyPill = terrainName.enemyPill0.properties,
            enemyPill = terrainName.enemyPill15.properties,

            deadFriendlyPill = terrainName.friendlyPill0.properties,
            friendlyPill = terrainName.friendlyPill15.properties,

            base = terrainName.enemyBase.properties;

          switch (map[y][x].properties) {
          case deadEnemyPill:
          case enemyPill:
            tile = enemyPillTiles[map[y][x].id];
            break;

          case deadFriendlyPill:
          case friendlyPill:
            tile = friendlyPillTiles[map[y][x].id];
            break;

          case base:
            tile = baseTiles[map[y][x].id];
            break;

          case wall:
            properties = terrainName.wall.properties;

            lftbot = (x > 0   && y < 255) ?
                map[y + 1][x - 1].properties : seaProperties;

            rghbot = (x < 255 && y < 255) ?
                map[y + 1][x + 1].properties : seaProperties;

            lfttop = (x > 0   && y > 0) ?
                map[y - 1][x - 1].properties : seaProperties;

            rghtop = (x < 255 && y > 0) ?
                map[y - 1][x + 1].properties : seaProperties;

            num =
              (lftbot.isWallLike ? 128 : 0) +
              (rghbot.isWallLike ? 64  : 0) +
              (lfttop.isWallLike ? 32  : 0) +
              (rghtop.isWallLike ? 16  : 0) +
              (left.isWallLike   ? 8   : 0) +
              (right.isWallLike  ? 4   : 0) +
              (bottom.isWallLike ? 2   : 0) +
              (top.isWallLike    ? 1   : 0);

            switch (num) {
            case 2:
            case 18:
            case 34:
            case 50:
            case 66:
            case 82:
            case 98:
            case 114:
            case 130:
            case 146:
            case 162:
            case 178:
            case 194:
            case 210:
            case 226:
            case 242:
              index = 0;
              break;

            case 70:
            case 86:
            case 102:
            case 118:
            case 198:
            case 214:
            case 230:
            case 246:
              index = 1;
              break;

            case 206:
            case 222:
            case 238:
            case 254:
              index = 2;
              break;

            case 138:
            case 154:
            case 170:
            case 186:
            case 202:
            case 218:
            case 234:
            case 250:
              index = 3;
              break;

            case 191:
              index = 4;
              break;

            case 127:
              index = 5;
              break;

            case 14:
            case 30:
            case 46:
            case 62:
              index = 6;
              break;

            case 11:
            case 27:
            case 75:
            case 91:
              index = 7;
              break;

            case 142:
            case 158:
            case 174:
            case 190:
              index = 8;
              break;

            case 43:
            case 59:
            case 107:
            case 123:
              index = 9;
              break;

            case 15:
              index = 10;
              break;

            case 3:
            case 19:
            case 35:
            case 51:
            case 67:
            case 83:
            case 99:
            case 115:
            case 131:
            case 147:
            case 163:
            case 179:
            case 195:
            case 211:
            case 227:
            case 243:
              index = 11;
              break;

            case 87:
            case 119:
            case 215:
            case 247:
              index = 12;
              break;

            case 255:
              index = 13;
              break;

            case 171:
            case 187:
            case 235:
            case 251:
              index = 14;
              break;

            case 239:
              index = 15;
              break;

            case 223:
              index = 16;
              break;

            case 7:
            case 39:
            case 135:
            case 167:
              index = 17;
              break;

            case 13:
            case 77:
            case 141:
            case 205:
              index = 18;
              break;

            case 71:
            case 103:
            case 199:
            case 231:
              index = 19;
              break;

            case 29:
            case 93:
            case 157:
            case 221:
              index = 20;
              break;

            case 159:
              index = 21;
              break;

            case 111:
              index = 22;
              break;

            case 1:
            case 17:
            case 33:
            case 49:
            case 65:
            case 81:
            case 97:
            case 113:
            case 129:
            case 145:
            case 161:
            case 177:
            case 193:
            case 209:
            case 225:
            case 241:
              index = 23;
              break;

            case 21:
            case 53:
            case 85:
            case 117:
            case 149:
            case 181:
            case 213:
            case 245:
              index = 24;
              break;

            case 61:
            case 125:
            case 189:
            case 253:
              index = 25;
              break;

            case 41:
            case 57:
            case 105:
            case 169:
            case 121:
            case 185:
            case 233:
            case 249:
              index = 26;
              break;

            case 6:
            case 22:
            case 38:
            case 54:
            case 134:
            case 150:
            case 166:
            case 182:
              index = 27;
              break;

            case 10:
            case 26:
            case 42:
            case 58:
            case 74:
            case 90:
            case 106:
            case 122:
              index = 28;
              break;

            case 47:
              index = 29;
              break;

            case 31:
              index = 30;
              break;

            case 23:
            case 55:
            case 151:
            case 183:
              index = 31;
              break;

            case 78:
            case 94:
            case 110:
            case 126:
              index = 32;
              break;

            case 63:
              index = 33;
              break;

            case 95:
              index = 34;
              break;

            case 0:
            case 16:
            case 32:
            case 48:
            case 64:
            case 80:
            case 96:
            case 128:
            case 144:
            case 160:
            case 192:
            case 112:
            case 176:
            case 208:
            case 224:
            case 240:
              index = 35;
              break;

            case 4:
            case 20:
            case 36:
            case 52:
            case 68:
            case 84:
            case 100:
            case 116:
            case 132:
            case 148:
            case 164:
            case 180:
            case 196:
            case 212:
            case 228:
            case 244:
              index = 36;
              break;

            case 12:
            case 28:
            case 44:
            case 60:
            case 76:
            case 92:
            case 108:
            case 124:
            case 140:
            case 156:
            case 172:
            case 188:
            case 204:
            case 220:
            case 236:
            case 252:
              index = 37;
              break;

            case 8:
            case 24:
            case 40:
            case 56:
            case 72:
            case 88:
            case 104:
            case 120:
            case 136:
            case 152:
            case 168:
            case 184:
            case 200:
            case 216:
            case 232:
            case 248:
              index = 38;
              break;

            case 5:
            case 37:
            case 69:
            case 101:
            case 133:
            case 165:
            case 197:
            case 229:
              index = 39;
              break;

            case 9:
            case 25:
            case 73:
            case 89:
            case 137:
            case 153:
            case 201:
            case 217:
              index = 40;
              break;

            case 143:
              index = 41;
              break;

            case 79:
              index = 42;
              break;

            case 45:
            case 109:
            case 173:
            case 237:
              index = 43;
              break;

            case 139:
            case 155:
            case 203:
            case 219:
              index = 44;
              break;

            case 175:
              index = 45;
              break;

            case 207:
              index = 46;
              break;

            default:
              index = 13;
              break;
            }
            tile = wallTiles[index];
            break;

          case river:
            properties = terrainName.road;

            num =
              (left.isWaterLike   ? 8 : 0) +
              (right.isWaterLike  ? 4 : 0) +
              (bottom.isWaterLike ? 2 : 0) +
              (top.isWaterLike    ? 1 : 0);

            switch (num) {
            case 2:
              index = 0;
              break;

            case 6:
              index = 1;
              break;

            case 14:
              index = 2;
              break;

            case 10:
              index = 3;
              break;

            case 3:
              index = 4;
              break;

            case 7:
              index = 5;
              break;

            case 11:
              index = 7;
              break;

            case 1:
              index = 8;
              break;

            case 5:
              index = 9;
              break;

            case 13:
              index = 10;
              break;

            case 9:
              index = 11;
              break;

            case 0:
              index = 12;
              break;

            case 4:
              index = 13;
              break;

            case 12:
              index = 14;
              break;

            case 8:
              index = 15;
              break;

            default:
              index = 6;
              break;
            }
            tile = riverTiles[index];
            break;

          case swamp:
            tile = swampTiles[0];
            break;

          case crater:
            properties = terrainName.crater.properties;

            num =
              (left   === properties ? 8 : 0) +
              (right  === properties ? 4 : 0) +
              (bottom === properties ? 2 : 0) +
              (top    === properties ? 1 : 0);

            switch (num) {
            case 2:
              index = 0;
              break;

            case 6:
              index = 1;
              break;

            case 14:
              index = 2;
              break;

            case 10:
              index = 3;
              break;

            case 3:
              index = 4;
              break;

            case 7:
              index = 5;
              break;

            case 11:
              index = 7;
              break;

            case 1:
              index = 8;
              break;

            case 5:
              index = 9;
              break;

            case 13:
              index = 10;
              break;

            case 9:
              index = 11;
              break;

            case 0:
              index = 12;
              break;

            case 4:
              index = 13;
              break;

            case 12:
              index = 14;
              break;

            case 8:
              index = 15;
              break;

            default:
              index = 6;
              break;
            }
            tile = craterTiles[index];
            break;

          case road:
            lftbot = (x > 0   && y < 255) ?
                map[y + 1][x - 1].properties : seaProperties;

            rghbot = (x < 255 && y < 255) ?
                map[y + 1][x + 1].properties : seaProperties;

            lfttop = (x > 0   && y > 0) ?
                map[y - 1][x - 1].properties : seaProperties;

            rghtop = (x < 255 && y > 0) ?
                map[y - 1][x + 1].properties : seaProperties;

            num =
              (left.isRoadLike ? 8 : 0) +
              (right.isRoadLike ? 4 : 0) +
              (bottom.isRoadLike ? 2 : 0) +
              (top.isRoadLike ? 1 : 0);

            switch (num) {
            case 6:
              index = left.isWaterLike && top.isWaterLike ? 16 :
                  (rghbot.isRoadLike ? 13 : 1);
              break;

            case 10:
              index = right.isWaterLike && top.isWaterLike ? 18 :
                  (lftbot.isRoadLike ? 15 : 2);
              break;

            case 5:
              index = left.isWaterLike && bottom.isWaterLike ? 28 :
                  (rghtop.isRoadLike ? 25 : 3);
              break;

            case 9:
              index = right.isWaterLike && bottom.isWaterLike ? 30 :
                  (lfttop.isRoadLike ? 27 : 4);
              break;

            case 1:
            case 2:
            case 3:
              index = left.isWaterLike && right.isWaterLike ? 11 : 5;
              break;

            case 4:
            case 8:
            case 12:
              index = bottom.isWaterLike && top.isWaterLike ? 12 : 6;
              break;

            case 7:
              index = left.isWaterLike ? 22 :
                  (rghbot.isRoadLike || rghtop.isRoadLike ? 19 : 7);
              break;

            case 13:
              index = bottom.isWaterLike ? 29 :
                  (lfttop.isRoadLike || rghtop.isRoadLike ? 26 : 8);
              break;

            case 14:
              index = top.isWaterLike ? 17 :
                  (lftbot.isRoadLike || rghbot.isRoadLike ? 14 : 9);
              break;

            case 11:
              index = right.isWaterLike ? 24 :
                  (lftbot.isRoadLike || lfttop.isRoadLike ? 21 : 10);
              break;

            case 15:
              index =
                !lftbot.isRoadLike && !rghbot.isRoadLike &&
                !lfttop.isRoadLike && !rghtop.isRoadLike ?
                    0 : 20;
              break;

            default:
              index =
                left.isWaterSource && right.isWaterSource &&
                bottom.isWaterSource && top.isWaterSource ?
                    23 : 20;
            }
            tile = roadTiles[index];
            break;

          case forest:
            properties = terrainName.forest.properties;

            num =
              (left   === properties ? 8 : 0) +
              (right  === properties ? 4 : 0) +
              (bottom === properties ? 2 : 0) +
              (top    === properties ? 1 : 0);

            switch (num) {
            case 2:
              index = 0;
              break;

            case 6:
              index = 1;
              break;

            case 10:
              index = 2;
              break;

            case 1:
              index = 3;
              break;

            case 5:
              index = 4;
              break;

            case 9:
              index = 5;
              break;

            case 4:
              index = 7;
              break;

            case 8:
              index = 8;
              break;

            case 0:
              index = 9;
              break;

            default:
              index = 6;
              break;
            }
            tile = forestTiles[index];
            break;

          case rubble:
            tile = rubbleTiles[0];
            break;

          case grass:
            tile = grassTiles[0];
            break;

          case damagedWall:
            tile = damagedWallTiles[0];
            break;

          case boat:
            properties = terrainName.road;

            num =
              (left.isWaterSource   ? 8 : 0) +
              (right.isWaterSource  ? 4 : 0) +
              (bottom.isWaterSource ? 2 : 0) +
              (top.isWaterSource    ? 1 : 0);

            switch (num) {
            case 1:
            case 13:
              index = 1;
              break;

            case 9:
              index = 2;
              break;

            case 8:
            case 11:
              index = 3;
              break;

            case 10:
              index = 4;
              break;

            case 2:
            case 14:
              index = 5;
              break;

            case 6:
              index = 6;
              break;

            case 4:
            case 7:
              index = 7;
              break;

            default:
              index = 0;
              break;
            }
            tile = boatTiles[index];
            break;

          case sea:
            properties = terrainName.sea.properties;

            num =
              (left   === properties ? 8 : 0) +
              (right  === properties ? 4 : 0) +
              (bottom === properties ? 2 : 0) +
              (top    === properties ? 1 : 0);

            switch (num) {
            case 2:
            case 14:
              index = 0;
              break;

            case 6:
              index = 1;
              break;

            case 10:
              index = 2;
              break;

            case 1:
            case 13:
              index = 3;
              break;

            case 5:
              index = 4;
              break;

            case 9:
              index = 5;
              break;

            case 4:
            case 7:
              index = 7;
              break;

            case 8:
            case 11:
              index = 8;
              break;

            default:
              index = 6;
              break;
            }
            tile = seaTiles[index];
            break;

          default:
            throw new Error();
          }

          this.tiles[y][x] = tile;
        };
      }()),

      refreshRect: function (rect) {
        var x, y, height = rect.height, width = rect.width;

        for (y = rect.y; y < height; y += 1) {
          for (x = rect.x; x < width; x += 1) {
            this.refreshTile(x, y);
          }
        }
      },

      drawTile: function (ctx, x, y) {
        var tile = this.tiles[y][x], srcTileWidth = 64, dstTileWidth = 16,
          img = ns.images.tiles;

        ctx.drawImage(img,
            tile.x * srcTileWidth, tile.y * srcTileWidth,
            srcTileWidth, srcTileWidth,
            x * dstTileWidth, y * dstTileWidth, dstTileWidth, dstTileWidth);

        // draw mine
        if (this.map[y][x].isMined) {
          ctx.drawImage(img,
            0, 11 * srcTileWidth, srcTileWidth, srcTileWidth,
            x * dstTileWidth, y * dstTileWidth, dstTileWidth, dstTileWidth);
        }

        // draw fog
        /*if (false) {
          ctx.drawImage(img,
            1 * tileWidth, 11 * tileWidth, tileWidth, tileWidth,
            x * tileWidth, y * tileWidth, tileWidth, tileWidth);
        }*/
      },

      drawRect: function (ctx, rect) {
        var x, y, xMax, yMax;

        rect = rect.intersect(ns.bolo.worldRect);

        xMax = rect.x + rect.width;
        yMax = rect.y + rect.height;

        for (y = rect.y; y < yMax; y += 1) {
          for (x = rect.x; x < xMax; x += 1) {
            this.drawTile(ctx, x, y);
          }
        }
      }

      /*diff: function (rect, x, y, callback) {
        var i, j, map;

        map = tileMap.map;

        for (i = 0; i < rect.height; i += 1) {
          for (j = 0; j < rect.width; j += 1) {
            if (map[rect.y + i][rect.x + j] !== map[y + i][x + j]) {
              callback(j, i);
            }
          }
        }
      },*/

      /*fogTest: function (rect) {
        var x, y, map, row;

        map = tileMap.map;

        for (y = rect.y; y < rect.y + rect.height; y += 1) {
          row = map[y];

          for (x = rect.x; x < rect.x + rect.width; x += 1) {
            // test to see if tile is still visible by other objects
            // if not
            if (true) {
              row[x] = row[x].getFogged();
              // draw
            }
          }
        }
      }*/
    };

    return prototype.constructor;
  }());
}(BOLO));
