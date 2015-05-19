/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
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
var EOL = require('os').EOL;

var LINE_SEARCH = 5;

function hasLicense(content) {
  var lines = content.split(EOL);
  return lines.slice(0, LINE_SEARCH).join(EOL).indexOf('@license') > -1;
}

function addLicense(header, content) {
  return header + EOL + content;
}

function addLicenseHTML(header, content) {
  var lines = content.split(EOL);
  var docTypeLoc = 0;
  // insert license comment after doctype
  var doctypeSearch = /<!\s*doctype/i;
  for (var i = 0; i < lines.length; i++) {
    if (doctypeSearch.test(lines[i])) {
      docTypeLoc = i + 1;
      break;
    }
  }
  lines.splice(docTypeLoc, 0, '<!--', header + '-->');
  return lines.join(EOL);
}

function notarize(opts) {
  opts = opts || {};
  var header = opts.header || '';
  if (!header) {
    throw 'header needed!';
  }
  if (!hasLicense(header)) {
    throw 'header needs @license';
  }
  return map(function(file, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }
    if (file.isStream()) {
      return cb(new Error('streams not supported!'));
    }
    var content = file.contents.toString();
    var extname = path.extname(file.path);
    if (!hasLicense(content)) {
      if (extname === '.html') {
        content = addLicenseHTML(header, content);
      } else {
        content = addLicense(header, content);
      }
      file.contents = new Buffer(content);
    }
    cb(null, file);
  });
}

module.exports = notarize;
module.exports.hasLicense = hasLicense;
module.exports.addLicense = addLicense;
module.exports.addLicenseHTML = addLicenseHTML;
