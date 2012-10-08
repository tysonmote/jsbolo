/* Author: Robert Chrzanowski */

/*jslint
  browser: true, node: true, devel: true, indent: 2 */

/*globals BOLO */

(function () {
  'use strict';

  var ns, Rect;

  if (typeof window === 'undefined') {
    // we're in node
    ns = exports;

  } else {
    // we're in a browser
    ns = window.BOLO;
  }

  ns.Rect = Rect = (function () {
    var prototype = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,

      constructor: function (x, y, width, height) {
        var rect = Object.create(prototype);

        rect.x = x;
        rect.y = y;
        rect.width = width;
        rect.height = height;

        return rect;
      },

      intersect: function (rect) {
        var
          myX = this.x,
          myY = this.y,
          rectX = rect.x,
          rectY = rect.y,
          x = Math.max(myX, rectX),
          y = Math.max(myY, rectY);

        return new Rect(
          x,
          y,
          Math.min(myX + this.width, rectX + rect.width) - x,
          Math.min(myY + this.height, rectY + rect.height) - y
        );
      },

      union: function (rect) {
        var x, y, width, height;

        x = Math.min(this.x, rect.x);
        y = Math.min(this.y, rect.y);

        width = Math.max(this.x + this.width, rect.x + rect.width) - x;
        height = Math.max(this.y + this.height, rect.y + rect.height) - y;

        return new Rect(x, y, width, height);
      },

      inset: function (width, height) {
        return new Rect(
          this.x + width,
          this.y + height,
          this.width - (width * 2),
          this.height - (height * 2)
        );
      },

      insetX: function (left, right) {
        return new Rect(
          this.x + left,
          this.y,
          this.width - (left + right),
          this.height
        );
      },

      insetY: function (bottom, top) {
        return new Rect(
          this.x,
          this.y + bottom,
          this.width,
          this.height - (bottom + top)
        );
      },

      insetLeft: function (amount) {
        return new Rect(
          this.x + amount,
          this.y,
          this.width - amount,
          this.height
        );
      },

      insetRight: function (amount) {
        return new Rect(
          this.x,
          this.y,
          this.width - amount,
          this.height
        );
      },

      insetBottom: function (amount) {
        return new Rect(
          this.x,
          this.y + amount,
          this.width,
          this.height - amount
        );
      },

      insetTop: function (amount) {
        return new Rect(
          this.x,
          this.y,
          this.width,
          this.height - amount
        );
      },

      subtract: (function () {
        var
          array,
          testAdd = function (x, y, width, height) {
            if (width > 0 && height > 0) {
              array.push(new Rect(x, y, width, height));
            }
          };

        return function (rect) {
          var
            left = this.x,
            center = rect.x,
            width = rect.width,
            right = center + width,
            bottom = this.y,
            middle = rect.y,
            height = rect.height,
            top = middle + height,
            leftWidth = center - left,
            rightWidth = (left + this.width) - right,
            bottomHeight = middle - bottom,
            topHeight = (bottom + this.height) - top;

          array = [];

          testAdd(left,   bottom, leftWidth,  bottomHeight);
          testAdd(left,   middle, leftWidth,  height);
          testAdd(left,   top,    leftWidth,  topHeight);
          testAdd(center, bottom, width,      bottomHeight);
          testAdd(center, top,    width,      topHeight);
          testAdd(right,  bottom, rightWidth, bottomHeight);
          testAdd(right,  middle, rightWidth, height);
          testAdd(right,  top,    rightWidth, topHeight);

          return array;
        };
      }()),

      translate: function (dx, dy) {
        return new Rect(this.x + dx, this.y + dy, this.width, this.height);
      },

      scale: function (scale) {
        return new Rect(
          this.x * scale,
          this.y * scale,
          this.width * scale,
          this.height * scale
        );
      },

      moveWithin: function (rect) {
        // moves this within rect within and if it's too big clips it
        var
          rectX = rect.x,
          rectY = rect.y,
          rectWidth = rect.width,
          rectHeight = rect.height,
          x = Math.max(this.x, rectX),
          y = Math.max(this.y, rectY),
          width = Math.min(this.width, rectWidth),
          height = Math.min(this.height, rectHeight);

        if (x + width > rectX + rectWidth) {
          x -= (x + width) - (rectX + rectWidth);
        }

        if (y + height > rectY + rectHeight) {
          y -= (y + height) - (rectY + rectHeight);
        }

        return new Rect(x, y, width, height);
      },

      tilize: function (width) {
        var
          thisX = this.x,
          thisY = this.y,
          x = Math.floor(thisX / width),
          y = Math.floor(thisY / width);

        return new ns.Rect(
          x,
          y,
          Math.floor((thisX + this.width) / width) - x + 1,
          Math.floor((thisY + this.height) / width) - y + 1
        );
      },

      xMax: function () {
        return this.x + this.width;
      },

      yMax: function () {
        return this.y + this.height;
      },

      // returns center of rect as { x:, y: }
      center: function () {
        return {
          x: this.x + (this.width * 0.5),
          y: this.y + (this.height * 0.5)
        };
      },

      // this is equal to rect but rect may not be object Rect
      isEqual: function (rect) {
        return this.x === rect.x && this.y === rect.y &&
          this.width === rect.width && this.height === rect.height;
      },

      // this has a positive area
      isPositive: function () {
        return this.width > 0 && this.height > 0;
      }
    };

    return prototype.constructor;
  }());
}());
