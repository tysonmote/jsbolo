/* Author: Robert Chrzanowski */

/*jslint
  browser: true, devel: true, indent: 2 */

/*globals BOLO, Modernizr, WebSocket */

(function () {
  'use strict';

  var
    ns = BOLO,
    fade,
    socket,
    send;

  // draws debug information
  ns.debug = true;

  /**
   *
   *
   */

  send = function (obj) {
    return socket.send(ns.parse.writeMessage('client', obj));
  };

  // used for fading elements
  fade = function (i) {
    setTimeout(function () {
      i.start += (i.end - i.start) / (i.seconds * i.frameRate);
      i.seconds -= 1 / i.frameRate;

      if (i.seconds > 0) {
        i.elem.style.opacity = i.start;
        fade(i);
      } else {
        i.elem.style.opacity = i.end;

        /*if (i.end === 0) {
          i.elem.style.display = 'none';
        }*/
      }
    }, 1000 / i.frameRate);
  };

  ns.client = {};

  ns.client.init = function () {
    if (!Modernizr.canvas || !Modernizr.websockets) {
      // no canvas, no websockets, no way
      return;
    }

    ns.bolo.worldRect = new ns.Rect(0, 0, ns.bolo.width, ns.bolo.width);
    ns.bolo.maxViewRect = new ns.Rect(
      0,
      0,
      ns.bolo.width * 16,
      ns.bolo.width * 16
    );

    // initialize user interface controller
    ns.ui.init();

    socket = new WebSocket('ws://' + location.host, ['bolo']);
    console.log('connecting');

    /**
     *
     *
     */

    socket.onopen = function () {
      console.log('opened');
    };

    /**
     *
     *
     */

    socket.onerror = function (error) {
      console.log('WebSocket Error ' + error);
    };

    /**
     *
     *
     */

    socket.onmessage = function (event) {
      var obj;

      obj = ns.parse.readMessage('server', event.data);

      switch (obj.message) {
      case 'mapList':
        ns.ui.updateMapList(obj.list);
        break;

      case 'gameList':
        ns.ui.updateGameList(obj.list);
        break;

      case 'gameData':
        ns.gameData = ns.BMap.fromString(obj.data);
        ns.ui.setGameData(ns.gameData);
        //ns.tileMap = ns.TileMap(ns.gameData);
        //ns.camera.refresh();
        break;

      case 'mapPreviewData':
        ns.ui.setMapPreview(ns.BMap.fromString(obj.data));
        break;

      default:
        throw new Error();
      }
    };

    /*
     *
     *
     */

    socket.onclose = function () {
      // show to user
      console.log('closed');
    };
  };

  ns.client.newGame = function (mapName) {
    send({
      message: 'newGame',
      mapName: mapName
    });
  };

  ns.client.mapPreview = function (mapName) {
    send({
      message: 'mapPreview',
      mapName: mapName
    });
  };

  ns.playState = function playState() {
    ns.update();
    ns.render();
    ns.frameRateCounter.countFrames();
  };

  ns.update = function () {
  };

  ns.render = function render() {
  };
}());

