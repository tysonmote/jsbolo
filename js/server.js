/* Author: Robert Chrzanowski */

/*jslint
  node: true, devel: true, indent: 2 */

(function () {
  'use strict';

  var fs, path, crypto, ws, parse, bmap,
    gamesArray;

  fs = require('fs');
  path = require('path');
  crypto = require('crypto');

  ws = require('./websocket.js');
  parse = require('./parse.js');
  bmap = require('./bmap.js');

  // array of all current playing games
  gamesArray = [];

  exports.upgrade = function (request, socket, head) {
    var magicString, secWsKey, hash, handshake,
      send, player;

    // initialize connection with objects
    if (request.headers['sec-websocket-protocol'] !== 'bolo') {
      console.log('incompatible protocol ' +
                  request.headers['sec-websocket-protocol']);
      return;
    }

    magicString = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    secWsKey = request.headers['sec-websocket-key'];

    hash = crypto.
           createHash('SHA1').
           update(secWsKey + magicString).
           digest('base64');

    handshake = 'HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
                'Upgrade: WebSocket\r\n' +
                'Connection: Upgrade\r\n' +
                'Sec-WebSocket-Protocol: bolo\r\n' +
                'Sec-WebSocket-Accept: ' + hash + '\r\n' +
                '\r\n';

    socket.write(handshake);

    player = {
      nickname: 'foobar',
      watchingArray: [],
      playingArray: []
    };

    console.log('upgrade');

    // a curry-like function
    send = function (message) {
      return socket.write(ws.encode(parse.writeMessage('server', message)));
    };

    socket.on('error', function (error) {
      // disconnect from games
      console.log('socket error ' + error);
    });

    socket.on('close', function (had_error) {
      // disconnect from games
      if (had_error) {
        console.log('transmission error');

      } else {
        console.log('closed');
      }
    });

    socket.on('end', function () {
      // disconnect from games

      console.log('end');
    });

    socket.on('data', function (data) {
      var obj;

      obj = parse.readMessage('client', ws.decode(data).toString());

      switch (obj.message) {
      case 'newGame':
        fs.readFile(path.join('maps', obj.map), (function (map, title) {
          return function (err, file) {
            var gameInfo;

            if (err) {
              throw err;
            }

            gameInfo = {
              title: title,
              map: map,
              data: bmap.BMap.fromData(file),
              playing: [player],
              watching: []
            };

            send({
              message: 'gameData',
              id: gamesArray.push(gameInfo) - 1,
              title: gameInfo.title,
              map: gameInfo.map,
              data: gameInfo.data.toString()
            });

            player.playingArray.push(gameInfo);
          };
        }(obj.map, obj.title)));
        break;

      case 'watchGame':
        (function () {
          var gameInfo;

          gameInfo = gamesArray[obj.id];

          send({
            message: 'watchData',
            id: obj.id,
            title: gameInfo.title,
            map: gameInfo.map,
            data: gameInfo.data.toString()
          });

          gameInfo.watching.push(player);
          player.watchingArray.push(gameInfo);

          console.log('watchGame');
        }());
        break;

      case 'preview':
        fs.readFile(path.join('maps', obj.map), (function (map) {
          return function (err, file) {
            if (err) {
              throw err;
            }

            send({
              message: 'previewData',
              map: map,
              data: bmap.BMap.fromData(file).toString()
            });
          };
        }(obj.map)));
        break;

      case 'enterGame':
        console.log('enterGame');
        break;

      case 'listGames':
        (function () {
          var list, length, game, i, players, playingLength, j;

          list = [];
          length = gamesArray.length;
          for (i = 0; i < length; i += 1) {
            game = gamesArray[i];

            if (game) {
              players = [];
              playingLength = game.playing.length;
              for (j = 0; j < playingLength; j += 1) {
                players[j] = {
                  nickname: game.playing[j].nickname
                };
              }

              list.push({
                id: i,
                title: game.title,
                map: game.map,
                players: players
              });
            }
          }

          send({
            message: 'gameList',
            list: list
          });
          console.log('listGames');
        }());
        break;

      default:
        break;
      }
    });

    // send list of map files
    fs.readdir('./maps', function (err, list) {
      var mapList, i, length;

      if (err) {
        throw err;
      }

      mapList = [];
      length = list.length;

      for (i = 0; i < length; i += 1) {
        mapList.push({
          map: list[i]
        });
      }

      send({
        message: 'mapList',
        list: mapList
      });
    });
  };
}());
