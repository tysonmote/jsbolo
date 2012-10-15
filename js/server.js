/* Author: Robert Chrzanowski */

/*jslint
  node: true, devel: true, indent: 2 */

(function () {
  'use strict';

  var fs, path, crypto, ws, parse, bmap,
    sendMapList,
    sendGameList,
    games;

  fs = require('fs');
  path = require('path');
  crypto = require('crypto');

  ws = require('./websocket.js');
  parse = require('./parse.js');
  bmap = require('./bmap.js');

  // array of all current playing games
  games = [];

  sendMapList = function (send) {
    fs.readdir('./maps', function (err, list) {
      var mapList, i, length;

      if (err) {
        throw err;
      }

      mapList = [];
      length = list.length;

      for (i = 0; i < length; i += 1) {
        mapList.push({
          mapName: list[i]
        });
      }

      send({
        message: 'mapList',
        list: mapList
      });
    });
  };

  sendGameList = function (send) {
    send({
      message: 'gameList',
      list: []
    });
  };

  exports.upgrade = function (request, socket, head) {
    var magicString, secWsKey, hash, handshake,
      send;

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

    console.log('upgrade');

    // a curry-like function
    send = function (message) {
      return socket.write(ws.encode(parse.writeMessage('server', message)));
    };

    // send file list of maps
    sendMapList(send);
    sendGameList(send);

    socket.on('error', function (error) {
      console.log('socket error ' + error);
    });

    socket.on('close', function (had_error) {
      if (had_error) {
        console.log('transmission error');

      } else {
        console.log('closed');
      }
    });

    socket.on('end', function () {
      console.log('end');
    });

    socket.on('data', function (data) {
      var obj;

      obj = parse.readMessage('client', ws.decode(data).toString());

      switch (obj.message) {
      case 'newGame':
        // closure saving name of map as a parameter
        fs.readFile(path.join('maps', obj.mapName), (function (map, title) {
          return function (err, file) {
            var id;

            if (err) {
              throw err;
            }

            id = games.push(bmap.BMap.fromData(file)) - 1;

            send({
              message: 'gameData',
              id: id,
              title: title,
              map: map,
              data: games[id].toString()
            });
          };
        }(obj.mapName, 'No Title')));
        break;

      case 'watchGame':
        console.log('watchGame');
        break;

      case 'mapPreview':
        fs.readFile(path.join('maps', obj.mapName), (function (map) {
          return function (err, file) {
            if (err) {
              throw err;
            }

            send({
              message: 'mapPreviewData',
              map: map,
              data: bmap.BMap.fromData(file).toString()
            });
          };
        }(obj.mapName)));
        break;

      case 'enterGame':
        console.log('enterGame');
        break;

      case 'listGames':
        /*send({
          message: 'gameList',
          id: id,
          title: title,
          map: map,
          players: [
            {
              nickname: 'bob'
            }
          ]
        });*/
        console.log('listGames');
        break;

      default:
        break;
      }
    });
  };
}());
