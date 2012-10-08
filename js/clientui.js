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
    selectedElement,
    addWheelListener,
    mainCanvas,
    mapPreviewCanvas,
    mainView;

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

  mainCanvas = document.getElementById('bolo');
  mapPreviewCanvas = document.getElementById('preview');

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
    if (document.addEventListener) {
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

  // initializes the user interface controller

  ns.ui.init = function () {
    var boloContainer = document.getElementById('menu');

    // creates BoloView objects for main view and preview
    mainView = new ns.BoloView(mainCanvas);

    // handle window resize event
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

      mainView.resize(windowWidth, windowHeight);
    };

    // initialize body and canvas
    window.onresize();

    // mouse event handlers
    (function (element) {
      var startX, startY, lastX, lastY;

      document.addEventListener('mousedown', function (e) {
        if (e.target === element) {
          e.preventDefault();
          startX = lastX = e.x;
          startY = lastY = e.y;
        }
      }, false);

      document.addEventListener('mousemove', function (e) {
        if (e.target === element) {
          e.preventDefault();
          lastX = e.x;
          lastY = e.y;
        }
      }, false);

      document.addEventListener('mouseup', function (e) {
        if (e.target === element) {
          e.preventDefault();
        }
      }, false);

      document.ondragstart = function (e) {
        e.preventDefault();
        return false;
      };
    }(boloContainer));

    // touch event handlers
    (function (element) {
      var touches = [];

      // register touch event listeners
      document.addEventListener('touchstart', function (e) {
        var
          which = e.which,
          touch = e.targetTouches[which];

        if (e.target === element) {
          e.preventDefault();

          touches[which] = {
            lastX: touch.screenX,
            lastY: touch.screenY
          };
        }
      }, false);

      document.addEventListener('touchmove', function (e) {
        var
          which = e.which,
          touch = e.targetTouches[which],
          newX = touch.screenX,
          newY = touch.screenY,
          dx, dy, dxy;

        if (e.target === element) {
          e.preventDefault();

          // this algorithm minimizes slip from rounding
          dx = touches[which].lastX - newX;
          dy = touches[which].lastY - newY;
          dxy = mainView.moveView(dx, dy);

          touches[which] = {
            lastX: newX + (dx - dxy.dx),
            lastY: newY + (dy - dxy.dy)
          };
        }
      }, false);

      document.addEventListener('touchend', function (e) {
        if (e.target === element) {
          e.preventDefault();
          //document.removeEventListener('touchmove', touchMove, false);
          //document.removeEventListener('touchend', touchEnd, false);
        }
      }, false);
    }(boloContainer));

    // mouse wheel handler
    addWheelListener(boloContainer, function (e) {
      // only scroll when over canvas
      if (e.target === boloContainer) {
        e.preventDefault();

        mainView.moveView(
          Math.round(e.deltaX),
          Math.round(e.deltaY)
        );
      }
    }, false);

    document.onkeydown = function (e) {
      switch (e.keyCode) {
      case 39: // right arrow
        e.preventDefault();
        mainView.moveViewBlock(1, 0);
        break;

      case 40: // down arrow
        e.preventDefault();
        mainView.moveViewBlock(0, 1);
        break;

      case 38: // up arrow
        e.preventDefault();
        mainView.moveViewBlock(0, -1);
        break;

      case 37: // left arrow
        e.preventDefault();
        mainView.moveViewBlock(-1, 0);
        break;

      case 187: // =+, everything else uses this keycode
      case 61: // firefox gets this keycode
        e.preventDefault();
        mainView.zoomIn();
        break;

      case 189: // -_, everything else uses this keycode
      case 173: // firefox uses this keycode
        e.preventDefault();
        mainView.zoomOut();
        break;
      }
    };

    document.onkeyup = function (e) {
    };

    // register menu events

    // toggles 'hidden' class name on tabBodyDiv
    tabBarDiv.onclick = function (e) {
      var
        className = tabBodyDiv.className,
        regex = /(\s+|^)?hidden(\s+|$)?/i;

      e.preventDefault();

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

        ns.client.mapPreview(selectedElement.textContent);
      }
    };
  };

  ns.ui.setGameData = function (bmap) {
    var
      center = bmap.centerRect.center(),
      tileMap = new ns.TileMap(bmap);

    mainView.setTileMap(tileMap);
    mainView.centerView(center.x * 16, center.y * 16);
    mainView.draw();
  };

  ns.ui.setMapPreview = function (bmap) {
    bmap.draw(mapPreviewCanvas);
  };
}());
