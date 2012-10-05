/* Author: Robert Chrzanowski */

/*jslint
  browser: true, node: true, devel: true, indent: 2 */

/*globals BOLO */

//***** object prototypes *****
//*** consoleLog util object
//create constructor

(function () {
  'use strict';

  var ns = BOLO;

  ns.ConsoleLog = function ConsoleLog() {
  };

  //create function that will be added to the class
  ns.console_log = function console_log(message) {
    if (typeof console !== 'undefined' && console !== null) {
      console.log(message);
    }
  };

  //add class/static function to class by assignment
  ns.ConsoleLog.log = ns.console_log;
  //*** end console log object
  //*** frameRateCounter  object prototype

  ns.FrameRateCounter = function FrameRateCounter() {
    var dateTemp;

    this.lastFrameCount = 0;
    dateTemp = new Date();
    this.frameLast = dateTemp.getTime();
    this.frameCtr = 0;
  };

  ns.FrameRateCounter.prototype.constructor = ns.FrameRateCounter;

  ns.FrameRateCounter.prototype.countFrames =
    function frameRateCounterCountFrames() {
      var dateTemp = new Date();

      this.frameCtr += 1;

      if (dateTemp.getTime() >= this.frameLast + 1000) {
        //ConsoleLog.log('frame event');
        this.lastFrameCount = this.frameCtr;
        this.frameLast = dateTemp.getTime();
        this.frameCtr = 0;
      }
    };

  ns.Debugger = function () {};

  ns.Debugger.log = function (message) {
    try {
      console.log(message);
    } catch (exception) {
      return;
    }
  };
}());
