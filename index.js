/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// jshint node: true

'use strict';
var map = require('map-stream');
var path = require('path');
var PluginError = require('plugin-error');
var EOL = require('os').EOL;

var LINE_SEARCH = 5;

function hasLicense(content) {
  var lines = content.split(EOL);
  return lines.slice(0, LINE_SEARCH).join(EOL).indexOf('@license') > -1;
}

function split(content) {
  return content.split(EOL);
}

function join(lines) {
  return lines.join(EOL);
}

function findLocation(lines, regex) {
  for (var i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      return i + 1;
    }
  }
  return 0;
}

function addLicense(header, lines) {
  // insert license after #!
  var shabangLoc = findLocation(lines, /^#!/);
  lines.splice(shabangLoc, 0, '/**', header, '*/');
}

function addLicenseHTML(header, lines) {
  // insert license comment after doctype
  var docTypeLoc = findLocation(lines, /^<!\s*doctype/i);
  lines.splice(docTypeLoc, 0, '<!--', header + '-->');
}

function notarize(opts) {
  opts = opts || {};
  var header = opts.header || '';
  if (!header) {
    throw new PluginError('notary', 'header needed!');
  }
  if (!hasLicense(header)) {
    throw new PluginError('notary', 'header needs @license');
  }
  return map(function(file, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }
    if (file.isStream()) {
      return cb(new PluginError('notary', 'streams not supported!'));
    }
    var content = String(file.contents);
    if (!hasLicense(content)) {
      var lines = split(content);
      var extname = path.extname(file.path);
      if (extname === '.html') {
        addLicenseHTML(header, lines);
      } else {
        addLicense(header, lines);
      }
      file.contents = new Buffer(join(lines));
    }
    cb(null, file);
  });
}

module.exports = notarize;
module.exports.hasLicense = hasLicense;
module.exports.addLicense = addLicense;
module.exports.addLicenseHTML = addLicenseHTML;
