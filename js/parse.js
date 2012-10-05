/* Author: Robert Chrzanowski */

/*jslint
  browser: true, node: true, debug: true, indent: 2,
  bitwise: true */

/*globals BOLO */

(function () {
  'use strict';

  var ns, messages, messagesArray, source, i;

  if (typeof window === 'undefined') {
    // we're in node
    ns = exports;
    messagesArray = require('../data/messages.json');
  } else {
    // we're in the browser
    ns = BOLO.parse = {};
    messagesArray = BOLO.json.messages;
  }

  messages = {};

  for (source in messagesArray) {
    if (messagesArray.hasOwnProperty(source)) {
      messages[source] = {};

      for (i = 0; i < messagesArray[source].length; i += 1) {
        messagesArray[source][i].id = i;
        messages[source][messagesArray[source][i].message] =
          messagesArray[source][i];
      }
    }
  }

  // reads string and returns an object using properties for the format
  ns.readMessage = function parseReadMessage(source, string) {
    var offset, msgLen, id, readObj, properties;

    offset = 0;

    id = string.charCodeAt(offset);
    offset += 1;

    // recursive immediate function to read in obj properties
    properties = (function readObj(properties) {
      var obj = {}, key, i, j, length;

      if (!properties) {
        return {};
      }

      for (i = 0; i < properties.length; i += 1) {
        key = properties[i];

        switch (key.type) {
        case 'string':
          length = string.charCodeAt(offset);
          offset += 1;

          // check for really long strings
          if (length === 65535) {
            length = string.charCodeAt(offset) + 65535;
            offset += 1;
          }

          obj[key.name] = string.substr(offset, length);
          offset += length;

          break;

        case 'uint8':
          obj[key.name] = string.charCodeAt(offset);
          offset += 1;

          break;

        case 'uint16':
          obj[key.name] = string.charCodeAt(offset);
          offset += 1;

          break;

        case 'uint32':
          obj[key.name] = string.charCodeAt(offset) << 16;
          offset += 1;

          obj[key.name] |= string.charCodeAt(offset);
          offset += 1;

          break;

        case 'array':
          length = string.charCodeAt(offset);
          offset += 1;

          obj[key.name] = [];

          for (j = 0; j < length; j += 1) {
            obj[key.name].push(readObj(key.properties));
          }

          break;

        default:
          // invalid type
          throw {
            type: 'communication error',
            info:
              'parser doesn\'t understand type specified in json file'
          };
        }
      }

      return obj;
    }(messagesArray[source][id].properties));

    properties.message = messagesArray[source][id].message;

    return properties;
  };

  ns.writeMessage = function (source, obj) {
    var
      string, message, strLen, hdr, hdrLen,
      assert = true,
      strings = [],
      fromCharCode = String.fromCharCode;

    if (!messages.hasOwnProperty(source)) {
      throw new Error();
    }

    if (!messages[source].hasOwnProperty(obj.message)) {
      throw new Error();
    }

    message = messages[source][obj.message];

    // write message id
    strings.push(fromCharCode(message.id));

    // recursive immediate function to write obj to string
    (function writeObj(obj, properties) {
      var key, i, j;

      if (properties === undefined) {
        return;
      }

      for (i = 0; i < properties.length; i += 1) {
        key = properties[i];

        switch (key.type) {
        case 'string':
          // if the string length is long double down the length
          if (obj[key.name].length > 65534) {
            strings.push(fromCharCode(65535));
            strings.push(fromCharCode(obj[key.name].length - 65535));
            strings.push(obj[key.name]);
          } else {
            strings.push(fromCharCode(obj[key.name].length));
            strings.push(obj[key.name]);
          }

          break;

        case 'uint8':
          strings.push(fromCharCode(obj[key.name]));

          break;

        case 'uint16':
          strings.push(fromCharCode(obj[key.name]));

          break;

        case 'uint32':
          strings.push(fromCharCode(obj[key.name] >>> 16));
          strings.push(fromCharCode(obj[key.name] & 0x0000ffff));

          break;

        case 'array':
          strings.push(fromCharCode(obj[key.name].length));

          for (j = 0; j < obj[key.name].length; j += 1) {
            writeObj(obj[key.name][j], key.properties);
          }

          break;

        default:
          // invalid type
          // throw
          throw new Error();
        }
      }

      return obj;
    }(obj, message.properties));

    string = '';

    for (i = 0; i < strings.length; i += 1) {
      string += strings[i];
    }

    return string;
  };
}());
