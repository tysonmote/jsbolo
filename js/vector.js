/* Author: Robert Chrzanowski */

/*jslint
  indent: 2 */

/*globals BOLO */

(function () {
  'use strict';

  var
    ns = BOLO,
    Vec;

  // export this to our namespace
  ns.Vector = Vec = function (a) {
    this.a = a;
  };

  Vec.add = function (a, b) {
    var
      r = [],
      al = a.length,
      bl = b.length,
      l, m, f, i;

    if (al > bl) {
      l = al;
      m = bl;
      f = a;
    } else {
      l = bl;
      m = al;
      f = a;
    }

    for (i = 0; i < m; i += 1) {
      r[i] = a[i] + b[i];
    }

    while (i < l) {
      r[i] = f[i];
      i += 1;
    }

    return r;
  };

  Vec.sub = function (a, b) {
    var
      r = [],
      al = a.length,
      bl = b.length,
      l, m, f, i;

    if (al > bl) {
      l = al;
      m = bl;
      f = a;
    } else {
      l = bl;
      m = al;
      f = a;
    }

    for (i = 0; i < m; i += 1) {
      r[i] = a[i] - b[i];
    }

    while (i < l) {
      r[i] = f[i];
      i += 1;
    }

    return r;
  };

  Vec.mul = function (a, s) {
    var
      r = [],
      l = a.length,
      i;

    for (i = 0; i < l; i += 1) {
      r[i] = a[i] * s;
    }

    return r;
  };

  Vec.div = function (a, s) {
    var
      r = [],
      l = a.length,
      i;

    for (i = 0; i < l; i += 1) {
      r[i] = a[i] / s;
    }

    return r;
  };

  Vec.neg = function (a) {
    var
      r = [],
      l = a.length,
      i;

    for (i = 0; i < l; i += 1) {
      r[i] = -a[i];
    }

    return r;
  };

  Vec.dot = function (a, b) {
    var
      r = 0,
      al = a.length,
      bl = b.length,
      m, i;

    if (al > bl) {
      m = bl;
    } else {
      m = al;
    }

    for (i = 0; i < m; i += 1) {
      r += a[i] * b[i];
    }

    return r;
  };

  Vec.prototype.add = function (v) {
    return new Vec(Vec.add(this, v));
  };

  Vec.prototype.sub = function (v) {
    return new Vec(Vec.sub(this, v));
  };

  Vec.prototype.mul = function (s) {
    return new Vec(Vec.mul(this, s));
  };

  Vec.prototype.div = function (s) {
    return new Vec(Vec.div(this, s));
  };

  Vec.prototype.neg = function () {
    return new Vec(Vec.neg(this));
  };

  Vec.prototype.dot = function (v) {
    return new Vec(Vec.dot(this, v));
  };

  Vec.prototype.cross = function (v) {
    return new Vec(Vec.cross(this, v));
  };
}());
