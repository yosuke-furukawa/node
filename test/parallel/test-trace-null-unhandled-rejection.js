'use strict';

const common = require('../common');
const assert = require('assert');
const spawn = require('child_process').spawn;
const node = process.execPath;

if (process.argv[2] === 'child') {
  const rejectPromise = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(null), 100);
    });
  };
  rejectPromise();
} else {
  run();
}

function run() {
  const args = [__filename, 'child'];

  const child = spawn(node, args);
  let errorMessage = '';
  child.stderr.on('data', (data) => {
    errorMessage += data;
  });
  child.stderr.on('end', common.mustCall(() => {
    console.log(errorMessage);
    assert(errorMessage.match(
      /Uncaught \(in promise \w+:\d+\) null/));
  }));
  child.on('exit', common.mustCall((code) => {
    assert.strictEqual(code, 0);
  }));
}


