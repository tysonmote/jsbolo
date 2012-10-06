/* Author: Robert Chrzanowski */

/*jslint
  browser: true, devel: true, indent: 2 */

/*globals BOLO */

(function () {
  'use strict';

  var
    ns = BOLO,
    BoloView,
    tileWidth = 16;

  ns.BoloView = BoloView = (function () {
    var prototype = {
      canvas: null,
      ctx: null,
      tileMap: null,
      scale: 1,
      viewRect: null,

      constructor: function (canvas) {
        var boloView = Object.create(prototype);

        boloView.canvas = canvas;
        boloView.ctx = canvas.getContext('2d');
        boloView.tileMap = null;
        boloView.scale = 1;

        // initializes viewRect
        boloView.resize();

        return boloView;
      },

      resize: function () {
        var canvas = this.canvas;

        // this clears the canvas and sets it to the width and height to match
        // computed size
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        this.centerView(
          ns.bolo.maxViewRect.width / 2,
          ns.bolo.maxViewRect.height / 2
        );

        this.draw();
      },

      setTileMap: function (tileMap) {
        this.tileMap = tileMap;
        this.draw();
      },

      // move viewRect by (dx, dy) pixels
      moveView: function (dx, dy) {
        var
          canvas = this.canvas,
          viewRect = this.viewRect,
          scale = this.scale,
          canvasRect, copyRect,
          newViewRect, array, length, i;

        // convert (dx, dy) to viewRect pixels and round
        dx = Math.round(dx / scale);
        dy = Math.round(dy / scale);

        // translate viewRect within and keep within bounds
        newViewRect = viewRect.translate(
          dx,
          dy
        ).moveWithin(ns.bolo.maxViewRect);

        // convert (dx, dy) back to screen pixels
        dx = (newViewRect.x - viewRect.x) * scale;
        dy = (newViewRect.y - viewRect.y) * scale;

        if (dx !== 0 || dy !== 0) {
          this.viewRect = newViewRect;

          // copy paste screen buffer
          canvasRect = new ns.Rect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          copyRect = canvasRect.translate(-dx, -dy).intersect(canvasRect);

          if (copyRect.isPositive()) {
            this.ctx.drawImage(canvas,
              copyRect.x + dx, copyRect.y + dy, copyRect.width, copyRect.height,
              copyRect.x, copyRect.y, copyRect.width, copyRect.height);
          }

          // draw tiles have have scrolled into view
          array = newViewRect.subtract(viewRect);
          length = array.length;

          for (i = 0; i < length; i += 1) {
            this.drawRect(array[i]);
          }
        }

        return {
          dx: dx,
          dy: dy
        };
      },

      // move viewRect an increment, used for keyboard scrolling
      moveViewBlock: function (dx, dy) {
        var fourInvScale = 4 * tileWidth;
        this.moveView(dx * fourInvScale, dy * fourInvScale);
      },

      // centers on (x, y) in pixel coordinates
      centerView: function (x, y) {
        var
          canvas = this.canvas,
          scale = this.scale,
          canvasWidthScale = canvas.width / scale,
          canvasHeightScale = canvas.height / scale;

        this.viewRect = (new ns.Rect(
          Math.floor(x - (canvasWidthScale * 0.5)),
          Math.floor(y - (canvasHeightScale * 0.5)),
          canvasWidthScale,
          canvasHeightScale
        )).moveWithin(ns.bolo.maxViewRect);
      },

      // increases scale
      zoomIn: function () {
        var
          canvas, center,
          scale = this.scale;

        if (scale < 4) {
          if (scale >= 1) {
            this.scale = scale += 1;
          } else {
            this.scale = scale *= 2;
          }

          center = this.viewRect.center();
          this.centerView(center.x, center.y);

          // clear canvas
          canvas = this.canvas;
          this.ctx.clearRect(0, 0, canvas.width, canvas.height);

          // disable smoothing whe scale >= 1
          // works in firefox currently
          //this.ctx.mozImageSmoothingEnabled = scale < 1;

          this.draw();
        }
      },

      // decreases scale
      zoomOut: function (x, y) {
        var
          scale = this.scale,
          canvas, center, viewRect;

        if (scale > 0.5) {
          if (scale > 1) {
            this.scale = scale -= 1;
          } else {
            this.scale = scale /= 2;  // intentional
          }

          center = this.viewRect.center();
          this.centerView(center.x, center.y);

          viewRect = this.viewRect;

          this.viewRect = (new ns.Rect(
            Math.round(viewRect.x * scale) / scale,
            Math.round(viewRect.y * scale) / scale,
            viewRect.width,
            viewRect.height
          )).moveWithin(ns.bolo.maxViewRect);

          // clear canvas
          canvas = this.canvas;
          this.ctx.clearRect(0, 0, canvas.width, canvas.height);

          // disable smoothing whe scale >= 1
          //this.ctx.mozImageSmoothingEnabled = scale < 1;

          this.draw();
        }
      },

      // updates tileMap and screen buffer for all of viewRect
      refresh: function () {
        this.refreshRect(this.viewRect);
      },

      // updates tileMap and screen buffer for all of rect
      refreshRect: function (rect) {
        rect = rect.intersect(ns.bolo.maxViewRect);
        this.tileMap.refreshRect(rect.tilize(tileWidth));
        this.drawRect(rect);
      },

      // draws the entire screen buffer
      draw: function () {
        this.drawRect(this.viewRect);
      },

      // draws the screen buffer for rect, rect is in pixel coordinates
      drawRect: function (rect) {
        var
          ctx = this.ctx,
          scale = this.scale,
          viewRect = this.viewRect;

        if (this.tileMap) {
          ctx.save();

          // setup matrix
          ctx.scale(scale, scale);
          ctx.translate(-viewRect.x, -viewRect.y);

          // setup clipping region
          ctx.beginPath();
          ctx.rect(rect.x, rect.y, rect.width, rect.height);
          ctx.clip();

          // draw tiles under rect
          this.tileMap.drawRect(ctx, rect.tilize(tileWidth));

          ctx.restore();
        }
      }
    };

    return prototype.constructor;
  }());
}());
