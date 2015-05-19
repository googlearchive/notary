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
var path = require('path');
var fs = require('vinyl-fs');
var map = require('map-stream');
var EOL = require('os').EOL;

var LINE_SEARCH = 5;

var bannerFile = process.argv[2];

if (!bannerFile) {
  throw 'provide banner file!';
}

var banner = require('fs').readFileSync(bannerFile, 'utf-8');

if (!hasLicense(banner)) {
  throw 'Banner file needs @license!';
}

function hasLicense(content) {
  var lines = content.split(EOL);
  return lines.slice(0, LINE_SEARCH).join(EOL).indexOf('@license') > -1;
}

function addBanner(content) {
  return banner + EOL + content;
}

function addBannerHTML(content) {
  var lines = content.split(EOL);
  var docTypeLoc = 0;
  var doctypeSearch = /<!\s*doctype/i;
  for (var i = 0; i < lines.length; i++) {
    if (doctypeSearch.test(lines[i])) {
      docTypeLoc = i + 1;
      break;
    }
  }
  lines.splice(docTypeLoc, 0, '<!--', banner + '-->');
  return lines.join(EOL);
}

fs.src('{.,test}/*.{js,html,css}')
.pipe(map(function(file, cb) {
  var content = file.contents.toString();
  var extname = path.extname(file.path);
  if (!hasLicense(content)) {
    if (extname === '.html') {
      content = addBannerHTML(content);
    } else {
      content = addBanner(content);
    }
    file.contents = new Buffer(content);
    cb(null, file);
  } else {
    cb();
  }
}))
.pipe(fs.dest('.'));
