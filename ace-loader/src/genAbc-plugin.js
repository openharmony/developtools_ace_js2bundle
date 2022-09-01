/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const path = require('path');
const cluster = require('cluster');
const process = require('process');

const forward = '(global.___mainEntry___ = function (globalObjects) {' + '\n' +
              '  var define = globalObjects.define;' + '\n' +
              '  var require = globalObjects.require;' + '\n' +
              '  var bootstrap = globalObjects.bootstrap;' + '\n' +
              '  var register = globalObjects.register;' + '\n' +
              '  var render = globalObjects.render;' + '\n' +
              '  var $app_define$ = globalObjects.$app_define$;' + '\n' +
              '  var $app_bootstrap$ = globalObjects.$app_bootstrap$;' + '\n' +
              '  var $app_require$ = globalObjects.$app_require$;' + '\n' +
              '  var history = globalObjects.history;' + '\n' +
              '  var Image = globalObjects.Image;' + '\n' +
              '  var OffscreenCanvas = globalObjects.OffscreenCanvas;' + '\n' +
              '  (function(global) {' + '\n' +
              '    "use strict";' + '\n';
const last = '\n' + '})(this.__appProto__);' + '\n' + '})';
const firstFileEXT = '_.js';
const genAbcScript = 'gen-abc.js';
let output;
let isWin = false;
let isMac = false;
let isDebug = false;
let arkDir;
let nodeJs;
let intermediateJsBundle = [];
let workerFile = null;

class GenAbcPlugin {
  constructor(output_, arkDir_, nodeJs_, workerFile_, isDebug_) {
    output = output_;
    arkDir = arkDir_;
    nodeJs = nodeJs_;
    isDebug = isDebug_;
    workerFile = workerFile_;
  }
  apply(compiler) {
    if (fs.existsSync(path.resolve(arkDir, 'build-win'))) {
      isWin = true;
    } else if (fs.existsSync(path.resolve(arkDir, 'build-mac'))) {
      isMac = true;
    } else if (!fs.existsSync(path.resolve(arkDir, 'build'))) {
      return;
    }

    compiler.hooks.emit.tap('GenAbcPlugin', (compilation) => {
      const assets = compilation.assets;
      const keys = Object.keys(assets);
      keys.forEach(key => {
        // choice *.js
        if (output && path.extname(key) === '.js') {
          let newContent = assets[key].source();
          if (checkWorksFile(key, workerFile) && key !== 'commons.js' && key !== 'vendors.js') {
            newContent = forward + newContent + last;
          }
          if (key === 'commons.js' || key === 'vendors.js' || !checkWorksFile(key, workerFile)) {
            newContent = `\n\n\n\n\n\n\n\n\n\n\n\n\n\n` + newContent;
          }
          const keyPath = key.replace(/\.js$/, firstFileEXT)
          writeFileSync(newContent, path.resolve(output, keyPath), true);
        } else if (output && path.extname(key) === '.json' && process.env.DEVICE_LEVEL === 'card') {
          writeFileSync(assets[key].source(), path.resolve(output, key.replace(/\.json$/, '.json')),
            false);
        }
      })
    });
    compiler.hooks.afterEmit.tap('GenAbcPluginMultiThread', () => {
      invokeWorkerToGenAbc();
    });
  }
}

function checkWorksFile(assetPath, workerFile) {
  if (workerFile === null) {
    if (assetPath.search("./workers/") !== 0) {
      return true;
    } else {
      return false;
    }
  } else {
    for (const key in workerFile) {
      let keyExt = key + '.js';
      if (keyExt === assetPath) {
        return false;
      }
    }
  }

  return true;
}

function writeFileSync(inputString, output, isToBin) {
    const parent = path.join(output, '..');
    if (!(fs.existsSync(parent) && fs.statSync(parent).isDirectory())) {
        mkDir(parent);
    }
    fs.writeFileSync(output, inputString);
    if (fs.existsSync(output) && isToBin) {
      let fileSize = fs.statSync(output).size;
      intermediateJsBundle.push({path: output, size: fileSize});
    }
}

function mkDir(path_) {
    const parent = path.join(path_, '..');
    if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
        mkDir(parent);
    }
    fs.mkdirSync(path_);
}

function getSmallestSizeGroup(groupSize) {
  let groupSizeArray = Array.from(groupSize);
  groupSizeArray.sort(function(g1, g2) {
    return g1[1] - g2[1]; // sort by size
  });
  return groupSizeArray[0][0];
}

function splitJsBundlesBySize(bundleArray, groupNumber) {
  let result = [];
  if (bundleArray.length < groupNumber) {
    result.push(bundleArray);
    return result;
  }

  bundleArray.sort(function(f1, f2) {
    return f2.size - f1.size;
  });
  let groupFileSize = new Map();
  for (let i = 0; i < groupNumber; ++i) {
    result.push([]);
    groupFileSize.set(i, 0);
  }

  let index = 0;
  while(index < bundleArray.length) {
    let smallestGroup = getSmallestSizeGroup(groupFileSize);
    result[smallestGroup].push(bundleArray[index]);
    let sizeUpdate = groupFileSize.get(smallestGroup) + bundleArray[index].size;
    groupFileSize.set(smallestGroup, sizeUpdate);
    index++;
  }
  return result;
}

function invokeWorkerToGenAbc() {
  let param = '';
  if (isDebug) {
    param += ' --debug';
  }

  let js2abc = path.join(arkDir, 'build', 'src', 'index.js');
  if (isWin) {
    js2abc = path.join(arkDir, 'build-win', 'src', 'index.js');
  } else if (isMac) {
    js2abc = path.join(arkDir, 'build-mac', 'src', 'index.js');
  }

  const maxWorkerNumber = 3;
  const splitedBundles = splitJsBundlesBySize(intermediateJsBundle, maxWorkerNumber);
  const workerNumber = maxWorkerNumber < splitedBundles.length ? maxWorkerNumber : splitedBundles.length;
  const cmdPrefix = `${nodeJs} --expose-gc "${js2abc}" ${param} `;

  const clusterNewApiVersion = 16;
  const currentNodeVersion = parseInt(process.version.split('.')[0]);
  const useNewApi = currentNodeVersion >= clusterNewApiVersion ? true : false;

  if ((useNewApi && cluster.isPrimary) || (!useNewApi && cluster.isMaster)) {
    if (useNewApi) {
      cluster.setupPrimary({
        exec: path.resolve(__dirname, genAbcScript)
      });
    } else {
      cluster.setupMaster({
        exec: path.resolve(__dirname, genAbcScript)
      });
    }

    for (let i = 0; i < workerNumber; ++i) {
      let workerData = {
        "inputs": JSON.stringify(splitedBundles[i]),
        "cmd": cmdPrefix
      }
      cluster.fork(workerData);
    }

    cluster.on('exit', (worker, code, signal) => {});
  }
}

module.exports = {
  GenAbcPlugin: GenAbcPlugin,
  checkWorksFile: checkWorksFile
}
