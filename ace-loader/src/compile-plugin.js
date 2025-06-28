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
import Compilation from 'webpack/lib/Compilation';
import JavascriptModulesPlugin from 'webpack/lib/javascript/JavascriptModulesPlugin';
import CachedSource from 'webpack-sources/lib/CachedSource';
import ConcatSource from 'webpack-sources/lib/ConcatSource';

import {
  circularFile,
  useOSFiles,
  mkDir,
  elements
} from './util';
import cluster from 'cluster';

let mStats;
let mErrorCount = 0;
let mWarningCount = 0;
let isShowError = true;
let isShowWarning = true;
let isShowNote = true;
let warningCount = 0;
let noteCount = 0;
let errorCount = 0;

let GLOBAL_COMMON_MODULE_CACHE;

/**
 * Webpack plugin that manages compilation results, module caching, and asset processing
 * Handles multiple aspects of the build process including:
 * - Module discovery and caching
 * - Common and i18n resource management
 * - Build result reporting
 * - Global module caching
 */
class ResultStates {
  constructor(options) {
    this.options = options;
    GLOBAL_COMMON_MODULE_CACHE = `
      globalThis["__common_module_cache__${process.env.hashProjectPath}"] =` +
      ` globalThis["__common_module_cache__${process.env.hashProjectPath}"] || {};`;
  }

  apply(compiler) {
    const buildPath = this.options.build;
    const commonPaths = new Set();
    const i18nPaths = new Set();
    const cachePath = path.resolve(process.env.cachePath, process.env.DEVICE_LEVEL === 'rich' ?
                                  '.rich_cache' : '.lite_cache');
    const entryFile = path.join(cachePath, 'entry.json');
    const entryPaths = new Set();

    compiler.hooks.compilation.tap('toFindModule', (compilation) => {
      compilation.hooks.buildModule.tap("findModule", (module) => {
        if (module.resource && fs.existsSync(module.resource)) {
          entryPaths.add(module.resource);
        }
        if (module.context.indexOf(process.env.projectPath) >= 0) {
          return;
        }
        const modulePath = path.join(module.context);
        const srcIndex = modulePath.lastIndexOf(path.join('src', 'main', 'js'));
        if (srcIndex < 0) {
          return;
        }
        const commonPath = path.resolve(modulePath.substring(0, srcIndex),
          'src', 'main', 'js', 'common');
        if (fs.existsSync(commonPath)) {
          commonPaths.add(commonPath);
        }
        const i18nPath = path.resolve(modulePath.substring(0, srcIndex),
          'src', 'main', 'js', 'i18n');
        if (fs.existsSync(i18nPath)) {
          i18nPaths.add(i18nPath);
        }
      });
    });

    compiler.hooks.afterCompile.tap('copyFindModule', () => {
      for (let commonPath of commonPaths) {
        circularFile(commonPath, path.resolve(buildPath, '../share/common'));
      }
      for (let i18nPath of i18nPaths) {
        circularFile(i18nPath, path.resolve(buildPath, '../share/i18n'));
      }
      addCacheFiles(entryFile, cachePath, entryPaths);
    });

    compiler.hooks.done.tap('Result States', (stats) => {
      Object.keys(elements).forEach(key => {
        delete elements[key];
      })
      if (process.env.isPreview && process.env.aceSoPath &&
        useOSFiles && useOSFiles.size > 0) {
          writeUseOSFiles();
      }
      mStats = stats;
      warningCount = 0;
      noteCount = 0;
      errorCount = 0;
      if (mStats.compilation.errors) {
        mErrorCount = mStats.compilation.errors.length;
      }
      if (mStats.compilation.warnings) {
        mWarningCount = mStats.compilation.warnings.length;
      }
      if (process.env.error === 'false') {
        isShowError = false;
      }
      if (process.env.warning === 'false') {
        isShowWarning = false;
      }
      if (process.env.note === 'false') {
        isShowNote = false;
      }
      printResult(buildPath);
    });

    compiler.hooks.compilation.tap('CommonAsset', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'GLOBAL_COMMON_MODULE_CACHE',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          if (assets['commons.js']) {
            assets['commons.js'] = new CachedSource(
              new ConcatSource(assets['commons.js'], GLOBAL_COMMON_MODULE_CACHE));
          } else if (assets['vendors.js']) {
            assets['vendors.js'] = new CachedSource(
              new ConcatSource(assets['vendors.js'], GLOBAL_COMMON_MODULE_CACHE));
          }
        }
      );
    });

    compiler.hooks.compilation.tap('Require', compilation => {
      JavascriptModulesPlugin.getCompilationHooks(compilation).renderRequire.tap('renderRequire',
        (source) => {
          return process.env.DEVICE_LEVEL === 'rich' ? `var commonCachedModule =` +
          ` globalThis["__common_module_cache__${process.env.hashProjectPath}"] ? ` +
            `globalThis["__common_module_cache__${process.env.hashProjectPath}"]` +
            `[moduleId]: null;\n` +
            `if (commonCachedModule) { return commonCachedModule.exports; }\n` +
            source.replace('// Execute the module function',
            `function isCommonModue(moduleId) {
              if (globalThis["webpackChunk${process.env.hashProjectPath}"]) {
                const length = globalThis["webpackChunk${process.env.hashProjectPath}"].length;
                switch (length) {
                  case 1:
                    return globalThis["webpackChunk${process.env.hashProjectPath}"][0][1][moduleId];
                  case 2:
                    return globalThis["webpackChunk${process.env.hashProjectPath}"][0][1][moduleId] ||
                    globalThis["webpackChunk${process.env.hashProjectPath}"][1][1][moduleId];
                }
              }
              return undefined;
            }\n` +
            `if (globalThis["__common_module_cache__${process.env.hashProjectPath}"]` +
            ` && String(moduleId).indexOf("?name=") < 0 && isCommonModue(moduleId)) {\n` +
              `  globalThis["__common_module_cache__${process.env.hashProjectPath}"]` +
              `[moduleId] = module;\n}`) : source;
        });
    });
  }
}

/**
 * Manages cache files for build entries by reading existing cache and updating with new entries
 * 
 * @param {string} entryFile - Path to the cache file storing entry paths
 * @param {string} cachePath - Directory path where cache files are stored
 * @param {Set} entryPaths - Set containing new entry paths to cache
 */
function addCacheFiles(entryFile, cachePath, entryPaths) {
  const entryArray = [];
  if (fs.existsSync(entryFile)) {
    const oldArray = JSON.parse(fs.readFileSync(entryFile));
    oldArray.forEach(element => {
      entryPaths.add(element);
    })
  } else if (!(process.env.tddMode === 'true') && !(fs.existsSync(cachePath) && fs.statSync(cachePath).isDirectory())) {
    mkDir(cachePath);
  }
  entryArray.push(...entryPaths);
  if (fs.existsSync(cachePath) && fs.statSync(cachePath).isDirectory()) {
    fs.writeFileSync(entryFile, JSON.stringify(entryArray));
  }
}

const red = '\u001b[31m';
const yellow = '\u001b[33m';
const blue = '\u001b[34m';
const reset = '\u001b[39m';

/**
 * Writes compilation errors to a log file in the build directory
 * 
 * @param {string} buildPath - The directory path where the log file should be created
 * @param {string} content - The error content to write to the log file
 */
const writeError = (buildPath, content) => {
  fs.writeFile(path.resolve(buildPath, 'compile_error.log'), content, (err) => {
    if (err) {
      return console.error(err);
    }
  });
};

/**
 * Prints the final compilation result with detailed error/warning statistics
 * Handles both regular builds and preview modes with appropriate output formatting
 * 
 * @param {string} buildPath - The build directory path for error logging
 */
function printResult(buildPath) {
  printWarning();
  printError(buildPath);
  if (errorCount + warningCount + noteCount > 0 || process.env.abcCompileSuccess === 'false') {
    let result;
    const resultInfo = {};
    if (errorCount > 0) {
      resultInfo.ERROR = errorCount;
      result = 'FAIL ';
    } else {
      result = 'SUCCESS ';
    }

    if (process.env.abcCompileSuccess === 'false') {
      result = 'FAIL ';
    }

    if (warningCount > 0) {
      resultInfo.WARN = warningCount;
    }

    if (noteCount > 0) {
      resultInfo.NOTE = noteCount;
    }
    if (result === 'SUCCESS ' && process.env.isPreview === 'true') {
      printPreviewResult(resultInfo);
    } else {
      console.log(blue, 'COMPILE RESULT:' + result + JSON.stringify(resultInfo), reset);
    }
  } else {
    if (process.env.isPreview === 'true') {
      printPreviewResult();
    } else {
      console.log(blue, 'COMPILE RESULT:SUCCESS ', reset);
    }
  }
  clearArkCompileStatus();
}

/**
 * Resets the Ark compilation status flag to indicate successful compilation
 * Sets the environment variable 'abcCompileSuccess' to 'true'
 */
function clearArkCompileStatus() {
  process.env.abcCompileSuccess = 'true';
}

/**
 * Prints the preview build result after checking worker processes
 * Only displays success message when all worker processes have completed
 * 
 * @param {string} resultInfo - Additional result information to display (defaults to empty string)
 */
function printPreviewResult(resultInfo = "") {
  let workerNum = Object.keys(cluster.workers).length;
  if (workerNum === 0) {
    printSuccessInfo(resultInfo);
  }
}

/**
 * Prints compilation success information to the console with formatted output
 * Displays either a simple success message or detailed result information
 * 
 * @param {Array|Object} resultInfo - Additional success information to display
 */
function printSuccessInfo(resultInfo) {
  if (resultInfo.length === 0) {
    console.log(blue, 'COMPILE RESULT:SUCCESS ', reset);
  } else {
    console.log(blue, 'COMPILE RESULT:SUCCESS ' + JSON.stringify(resultInfo), reset);
  }
}

/**
 * Processes and prints compilation warnings and notes with formatted output
 * Handles different types of warning messages with color coding and filtering
 */
function printWarning() {
  if (mWarningCount > 0) {
    const warnings = mStats.compilation.warnings;
    const length = warnings.length;
    for (let index = 0; index < length; index++) {
      let message = warnings[index].message
      if (message.match(/noteStart(([\s\S])*)noteEnd/) !== null) {
        noteCount++;
        if (isShowNote) {
          console.info(' ' + message.match(/noteStart(([\s\S])*)noteEnd/)[1].trim(), reset, '\n')
        }
      } else if (message.match(/warnStart(([\s\S])*)warnEnd/) !== null) {
        warningCount++;
        if (isShowWarning) {
          console.warn(yellow, message.match(/warnStart(([\s\S])*)warnEnd/)[1].trim(), reset, '\n')
        }
      }
    }
    if (mWarningCount > length) {
      warningCount = warningCount + mWarningCount - length;
    }
  }
}

/**
 * Formats and prints compilation errors to console and writes to error log file
 * Handles both custom-formatted errors and standard webpack errors
 * 
 * @param {string} buildPath - The build directory path for error logging
 */
function printError(buildPath) {
  if (mErrorCount > 0) {
    const errors = mStats.compilation.errors;
    const length = errors.length;
    if (isShowError) {
      let errorContent = '';
      for (let index = 0; index < length; index++) {
        if (errors[index]) {
          let message = errors[index].message
          if (message) {
            if (message.match(/errorStart(([\s\S])*)errorEnd/) !== null) {
              const errorMessage = message.match(/errorStart(([\s\S])*)errorEnd/)[1];
              console.error(red, errorMessage.trim(), reset, '\n');
            } else {
              const messageArrary = message.split('\n')
              let logContent = ''
              messageArrary.forEach(element => {
                if (!(/^at/.test(element.trim()))) {
                  logContent = logContent + element + '\n'
                }
              });
              console.error(red, logContent, reset, '\n');
            }
            errorCount ++;
            errorContent += message
          }
        }
      }
      writeError(buildPath, errorContent);
    }
  }
}

/**
 * Writes a list of operating system-specific files to a tracking file
 * Maintains a cumulative record of OS-specific files across builds
 */
function writeUseOSFiles() {
  let oldInfo = '';
  if (!fs.existsSync(process.env.aceSoPath)) {
    const parent = path.join(process.env.aceSoPath, '..');
    if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
      mkDir(parent);
    }
  } else {
    oldInfo = fs.readFileSync(process.env.aceSoPath, 'utf-8') + '\n';
  }
  fs.writeFileSync(process.env.aceSoPath, oldInfo + Array.from(useOSFiles).join('\n'));
}

module.exports = ResultStates;
