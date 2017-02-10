'use strict';

const common = require('../common');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
let count = 0;

const enoentFile = path.join(common.tmpDir, 'non-existent-file-for-unwatch');
common.refreshTmpDir();
const shouldNotBeCalled = () =>
  assert.fail(false, true, 'watchFile listener should not be called');
const listener = common.mustCall(() => {
  if (count >= 1) {
    fs.unwatchFile(enoentFile);
    return;
  }
  fs.watchFile(enoentFile, {interval: 0}, shouldNotBeCalled);
  fs.unwatchFile(enoentFile, shouldNotBeCalled);
  setTimeout(() => {
    fs.closeSync(fs.openSync(enoentFile, 'w'));
  }, 10);
  count++;
}, 2);

fs.watchFile(enoentFile, {interval: 0}, listener);
fs.closeSync(fs.openSync(enoentFile, 'w'));
