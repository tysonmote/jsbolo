/* Author: Robert Chrzanowski */

/*jslint
  browser: true, devel: true, indent: 2 */

/*globals BOLO */

(function () {
  'use strict';

  var
    ns = BOLO,
    tabBodyDiv,
    tabBarDiv,
    newGameTabDiv,
    watchGameTabDiv,
    newGameDiv,
    watchGameDiv,
    mapListDiv,
    gameListDiv,
    canvas,
    selectedElement,
    addWheelListener,
    mainBoloView,
    previewBoloView;

  ns.ui = {};

  // get DOM elements
  tabBodyDiv = document.getElementById('tabBody');
  tabBarDiv = document.getElementById('tabBar');

  newGameTabDiv = document.getElementById('newGameTab');
  watchGameTabDiv = document.getElementById('watchGameTab');

  newGameDiv = document.getElementById('newGame');
  watchGameDiv = document.getElementById('watchGame');

  mapListDiv = document.getElementById('mapList');
  gameListDiv = document.getElementById('gameList');

  canvas = document.getElementById('bolo');

  /*
   * define some useful functions
   */

  /*
   * code ganked off of developer.mozilla.org and defuckified somewhat
   * creates a 'addwheelListener' method
   * example:
   * addWheelListener(elem, function(e) {
   *   console.log(e.deltaY); e.preventDefault();
   * });
   */

  addWheelListener = (function (window, document) {
    var
      prefix = '',
      addEventListener,
      addWheelListener,
      onwheel, support;

    // detect event model
    if (window.addEventListener) {
      addEventListener = 'addEventListener';
    } else {
      addEventListener = 'attachEvent';
      prefix = 'on';
    }

    // detect available wheel event
    if (document.onmousewheel !== undefined) {
      // Webkit and IE support at least 'mousewheel'
      support = 'mousewheel';
    }

    // Modern browsers support 'wheel'
    if (typeof document.WheelEvent === 'function') {
      support = 'wheel';
    }

    if (!support) {
      // let's assume that remaining browsers are older Firefox
      support = 'DOMMouseScroll';
    }

    addWheelListener = function (elem, eventName, callback, useCapture) {
      elem[addEventListener](
        prefix + eventName,
        support === 'wheel' ? callback :
            function (originalEvent) {
              var event;

              if (!originalEvent) {
                originalEvent = window.event;
              }

              // create a normalized event object
              event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: 'wheel',
                deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
                deltaX: 0,
                delatZ: 0,
                preventDefault: function () {
                  if (originalEvent.preventDefault) {
                    originalEvent.preventDefault();
                  } else {
                    originalEvent.returnValue = false;
                  }
                }
              };

              // calculate deltaY (and deltaX) according to the event
              if (support === 'mousewheel') {
                //event.deltaY = -1 / 40 * originalEvent.wheelDelta;
                if (typeof originalEvent.wheelDeltaY !== 'undefined') {
                  event.deltaY = -originalEvent.wheelDeltaY;
                } else {
                  event.deltaY = -originalEvent.wheelDelta;
                }

                // Webkit also support wheelDeltaX
                if (typeof originalEvent.wheelDeltaX !== 'undefined') {
                  //event.deltaX = -1 / 40 * originalEvent.wheelDeltaX;
                  event.deltaX = -originalEvent.wheelDeltaX;
                }
              } else {
                event.deltaY = originalEvent.detail;
              }

              // it's time to fire the callback
              return callback(event);
            },
        useCapture || false
      );
    };

    return function (elem, callback, useCapture) {
      addWheelListener(elem, support, callback, useCapture);

      // handle MozMousePixelScroll in older Firefox
      if (support === 'DOMMouseScroll') {
        addWheelListener(elem, 'MozMousePixelScroll', callback, useCapture);
      }
    };
  }(window, document));

  ns.ui.updateMapList = function (list) {
    var html, i, length;

    html = '<ol>';
    length = list.length;

    for (i = 0; i < length; i += 1) {
      html += '<li>' + list[i].mapName + '</li>\n';
    }

    html += '</ol>';

    mapListDiv.innerHTML = html;
  };

  ns.ui.updateGameList = function (list) {
    var html, i, length;

    html = '<ol>';
    length = list.length;

    for (i = 0; i < length; i += 1) {
      html += '<li>' + list[i].mapName + '</li>\n';
    }

    html = '</ol>';

    //gameListDiv.innerHTML = html;
  };

  ns.ui.init = function () {
    var
      mouseDown, mouseMove, mouseUp,
      touchStart, touchMove, touchEnd;

    mainBoloView = new ns.BoloView(canvas);
    previewBoloView = new ns.BoloView(canvas);

    // handle window resize event and initialize size
    window.onresize = function () {
      var
        windowWidth = window.innerWidth,
        windowHeight = window.innerHeight;

      // set body to window size
      document.body.setAttribute(
        'style',
        'width: ' + windowWidth + 'px; ' +
          'height: ' + windowHeight + 'px;'
      );

      mainBoloView.resize();
    };

    window.onresize();

    // register menu events
    tabBarDiv.onclick = function (e) {
      var
        className = tabBodyDiv.className,
        regex = /(\s+|^)?hidden(\s+|$)?/i;

      e.preventDefault();

      // toggles 'hidden' class name on tabBodyDiv

      if (regex.exec(className)) {
        className = className.replace(regex, '');
      } else {
        className += ' hidden';
      }

      tabBodyDiv.className = className;
    };

    newGameDiv.onclick = function (e) {
      var mapName;

      mapName = selectedElement.textContent;
      ns.client.newGame(mapName);

      // hides the tab body
      tabBodyDiv.className += ' hidden';
    };

    mapListDiv.onclick = function (e) {
      var element;

      element = e.target;

      if (element !== selectedElement) {
        element.className = 'selected';

        if (selectedElement) {
          selectedElement.className = null;
        }

        selectedElement = element;

        // makes new game button look clickable
        newGameDiv.className = 'button';
      }
    };

    // mouse event closures
    (function (element) {
      var startX, startY, lastX, lastY;

      mouseDown = function (e) {
        e.preventDefault();
        startX = lastX = e.x;
        startY = lastY = e.y;
        element.addEventListener('mousemove', mouseMove, false);
        element.addEventListener('mouseup', mouseUp, false);
      };

      mouseMove = function (e) {
        e.preventDefault();
        lastX = e.x;
        lastY = e.y;
      };

      mouseUp = function (e) {
        e.preventDefault();
        element.removeEventListener('mousemove', mouseMove, false);
        element.removeEventListener('mouseup', mouseUp, false);
      };
    }(canvas));

    // touch event closures
    (function () {
      var
        touches = [];

      touchStart = function (e) {
        var
          which = e.which,
          touch = e.targetTouches[which];

        e.preventDefault();

        touches[which] = {
          lastX: touch.screenX,
          lastY: touch.screenY
        };
      };

      touchMove = function (e) {
        var
          which = e.which,
          touch = e.targetTouches[which],
          newX = touch.screenX,
          newY = touch.screenY,
          dx, dy, dxy;

        e.preventDefault();

        // this algorithm minimizes slip from rounding
        dx = touches[which].lastX - newX;
        dy = touches[which].lastY - newY;
        dxy = mainBoloView.moveView(dx, dy);

        touches[which] = {
          lastX: newX + (dx - dxy.dx),
          lastY: newY + (dy - dxy.dy)
        };
      };

      touchEnd = function (e) {
        e.preventDefault();
        //document.removeEventListener('touchmove', touchMove, false);
        //document.removeEventListener('touchend', touchEnd, false);
      };
    }());

    // prevent default behavior for events we don't care about
    //document.addEventListener('touchstart', dragStart, false);
    canvas.addEventListener('mousedown', mouseDown, false);

    // register touch event listeners
    canvas.addEventListener('touchstart', touchStart, false);
    canvas.addEventListener('touchmove', touchMove, false);
    canvas.addEventListener('touchend', touchEnd, false);

    // mouse wheel handler
    addWheelListener(window, function (e) {

      // only scroll when over canvas
      if (e.target.id === 'menu') {
        e.preventDefault();

        mainBoloView.moveView(
          Math.round(e.deltaX),
          Math.round(e.deltaY)
        );
      }
    }, false);

    window.onkeydown = function (e) {
      switch (e.keyCode) {
      case 39: // right arrow
        e.preventDefault();
        mainBoloView.moveViewBlock(1, 0);
        break;

      case 40: // down arrow
        e.preventDefault();
        mainBoloView.moveViewBlock(0, 1);
        break;

      case 38: // up arrow
        e.preventDefault();
        mainBoloView.moveViewBlock(0, -1);
        break;

      case 37: // left arrow
        e.preventDefault();
        mainBoloView.moveViewBlock(-1, 0);
        break;

      case 187: // =+, everything else uses this keycode
      case 61: // firefox gets this keycode
        e.preventDefault();
        mainBoloView.zoomIn();
        break;

      case 189: // -_, everything else uses this keycode
      case 173: // firefox uses this keycode
        e.preventDefault();
        mainBoloView.zoomOut();
        break;
      }
    };

    window.onkeyup = function (e) {
    };
  };

  ns.ui.setMainTileMap = function (tileMap) {
    mainBoloView.setTileMap(tileMap);
  };
}());
