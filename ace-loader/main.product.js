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

var path = require('path')
var fs = require('fs')
var shell = require('shelljs');
const crypto = require("crypto")

const red = '\u001b[31m';
const reset = '\u001b[39m';
const multiResourceBuild = {};
const systemModules = [];

;(function readSystemModules() {
  const systemModulesPath = path.resolve(__dirname,'../../api');
  if (fs.existsSync(systemModulesPath)) {
    systemModules.push(...fs.readdirSync(systemModulesPath));
  }
})();

/**
 * Delete files.
 * @param {string} url The path of the file you want to delete.
 */
function deleteFolderRecursive(url) {
  let files = [];
  if (fs.existsSync(url)) {
    files = fs.readdirSync(url);
    files.forEach(function(file) {
      const curPath = path.join(url, file);
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdir(url, function(err) {});
  }
}

/**
 * Read manifest file for configuration information.
 * @param {string} manifestFilePath Path to configuration file.
 * @returns 
 */
function readManifest(manifestFilePath) {
  let manifest = {};
  try {
    if (fs.existsSync(manifestFilePath)) {
      const jsonString = fs.readFileSync(manifestFilePath).toString();
      manifest = JSON.parse(jsonString);
    }
  } catch (e) {
    throw Error('\u001b[31m' + 'ERROR: the manifest.json file format is invalid.' +
      '\u001b[39m').message;
  }
  return manifest;
}

/**
 * Load pages from manifest infomation.
 * @param {string} projectPath Current compiled file.
 * @param {string} device_level Current device version.
 * @param {string} abilityType Current Ability type.
 * @param {string} manifestFilePath Path to configuration file.
 * @returns {object} result of compiling the configuration infomation. 
 */
function loadEntryObj(projectPath, device_level, abilityType, manifestFilePath) {
  let entryObj = {};
  switch (abilityType) {
    case 'page':
      const appJSPath = path.resolve(projectPath, 'app.js');
      if (device_level === 'card') {
        entryObj = addPageEntryObj(readManifest(manifestFilePath), projectPath);
      } else {
        if (!fs.existsSync(appJSPath)) {
          throw Error(red + 'ERROR: missing app.js' + reset).message;
        }
        entryObj['./app'] = path.resolve(projectPath, './app.js?entry');
      }
      break;
    case 'form':
      entryObj = addPageEntryObj(readManifest(manifestFilePath), projectPath);
      entryObj[`./${abilityType}`] =  path.resolve(projectPath, `./${abilityType}.js?entry`);
      break;
    case 'testrunner':
      break;
    default:
      entryObj[`./${abilityType}`] =  path.resolve(projectPath, `./${abilityType}.js?entry`);
      break;
  }
  return entryObj;
}

/**
 * Read papes from manifest infomation.
 * @param {object} manifest Configuration infomation.
 * @param {string} projectPath Current compiled file.
 * @returns {object} Pages in configuration infomation.
 */
function addPageEntryObj(manifest, projectPath) {
  let entryObj = {};
  const pages = manifest.pages;
  if (pages === undefined) {
    throw Error('ERROR: missing pages').message;
  }
  pages.forEach((element) => {
    const sourcePath = element;
    const hmlPath = path.join(projectPath, sourcePath + '.hml');
    const aceSuperVisualPath = process.env.aceSuperVisualPath || '';
    const visualPath = path.join(aceSuperVisualPath, sourcePath + '.visual');
    const isHml = fs.existsSync(hmlPath);
    const isVisual = fs.existsSync(visualPath);
    if (isHml && isVisual) {
      throw Error(red + 'ERROR: ' + sourcePath + ' cannot both have hml && visual').message;
    } else if (isHml) {
      entryObj['./' + element] = path.resolve(projectPath, './' + sourcePath + '.hml?entry');
    } else if (isVisual) {
      entryObj['./' + element] = path.resolve(aceSuperVisualPath, './' + sourcePath +
        '.visual?entry');
    }
  })
  return entryObj;
}

/**
 * Match card mode.
 * @param {object} env Collection of environmental variables.
 */

function compileCardModule(env) {
  if (process.env.aceModuleJsonPath && fs.existsSync(process.env.aceModuleJsonPath)) {
    const moduleJsonConfig = JSON.parse(fs.readFileSync(process.env.aceModuleJsonPath).toString());
    if (moduleJsonConfig.module &&
      (moduleJsonConfig.module.uiSyntax === 'ets' || moduleJsonConfig.module.language === 'ets')) {
      process.env.DEVICE_LEVEL = 'card';
    } else if (validateCardModule(moduleJsonConfig) && !process.env.compileCardModule) {
      process.env.compileCardModule = true;
      const cmd = `webpack --config webpack.rich.config.js --env compilerType=${env.compilerType} ` +
        `DEVICE_LEVEL=card aceModuleRoot=${process.env.projectPath} ` +
        `aceModuleJsonPath=${process.env.aceModuleJsonPath} aceProfilePath=${process.env.aceProfilePath} ` +
        `watchMode=${process.env.watchMode} cachePath=${process.env.cachePath} ` +
        `aceModuleBuild=${process.env.buildPath}`;
      shell.exec(cmd, (err) => {
        if (err) {
          throw Error(err).message;
        }
      })
    }
  }
}

/**
 * Determine whether the current compilation is in card mode.
 * @param {object} moduleJsonConfig Configration for module.
 * @returns 
 */
function validateCardModule(moduleJsonConfig) {
  if (moduleJsonConfig.module && moduleJsonConfig.module.extensionAbilities) {
    for (let i = 0; i < moduleJsonConfig.module.extensionAbilities.length; i++) {
      const extensionAbility = moduleJsonConfig.module.extensionAbilities[i];
      if (extensionAbility.type && extensionAbility.type === 'form') {
        return true;
      }
    }
  }
  return false;
}

/**
 * Hash for projectPath.
 * @param {string} projectPath Current compiled file.
 */
function hashProjectPath(projectPath) {
  const hash = crypto.createHash('sha256')
  hash.update(projectPath.toString())
  process.env.hashProjectPath = "_" + hash.digest('hex');
}

/**
 * Check if the current compilation requires multiple resource.
 * @param {string} aceBuildJson Current compilation result path folder.
 */
function checkMultiResourceBuild(aceBuildJson) {
  if (aceBuildJson && fs.existsSync(aceBuildJson)) {
    try {
      const content = JSON.parse(fs.readFileSync(aceBuildJson));
      if (content["multiResourceBuild"]) {
        multiResourceBuild.value = content["multiResourceBuild"]
      }
      if (content["projectRootPath"]) {
        process.env.projectRootPath = content["projectRootPath"]
      }
    } catch (error) {
    }
  }
}

/**
 * Read worker configuration information.
 * @returns {object || null} Worker enttry pages.
 */
function readWorkerFile() {
  const workerEntryObj = {};
  if (process.env.aceBuildJson && fs.existsSync(process.env.aceBuildJson)) {
    const workerConfig = JSON.parse(fs.readFileSync(process.env.aceBuildJson).toString());
    if(workerConfig.workers) {
      workerConfig.workers.forEach(worker => {
        if (!/\.(js)$/.test(worker)) {
          worker += '.js';
        }
        const relativePath = path.relative(process.env.projectPath, worker);
        if (filterWorker(relativePath)) {
          workerEntryObj[relativePath.replace(/\.(ts|js)$/,'').replace(/\\/g, '/')] = worker;
        }
      })
      return workerEntryObj;
    }
  }
  return null;
}

/**
 * Regular for worker.
 * @param {string} workerPath Path of worker.
 * @returns {boolean} is pages.
 */
function filterWorker(workerPath) {
  return /\.(ts|js)$/.test(workerPath);
}

/**
 * Determine cache and decide whether to delete it. 
 * @param {string} cachePath Current compilation cache directory.
 * @returns 
 */
function compareCache(cachePath) {
  const entryFile = path.join(cachePath, 'entry.json');
  const cssFile = process.env.watchCSSFiles;

  let files = [];
  let cssObject = {};
  if (fs.existsSync(cssFile)) {
    cssObject = JSON.parse(fs.readFileSync(cssFile));
    if (cssObject['clear'] === true) {
      deleteFolderRecursive(cachePath);
      return;
    }
    Object.keys(cssObject).forEach(key => {
      if (key !== 'entry') {
        files.push(key);
      }
    })
  }

  if (fs.existsSync(entryFile)) {
    files = files.concat(JSON.parse(fs.readFileSync(entryFile)));
  }

  for(let file of files) {
    if (!fs.existsSync(file)) {
      deleteFolderRecursive(cachePath);
      break;
    } else if (cssObject['atime'] && cssObject['atime'][file]) {
      if (cssObject['atime'][file] !== fs.statSync(file).atime.toString()) {
        deleteFolderRecursive(cachePath);
        break;
      }
    }
  }
}

/**
 * Parse ability filePath.
 * @param {string} abilityType Current Ability type.
 * @param {string} projectPath Current compiled file.
 * @returns {string} ability filePath.
 */
function parseAbilityName(abilityType, projectPath) {
  if (abilityType === 'page') {
    return path.resolve(__dirname, projectPath, 'app.js');
  } else {
    return path.resolve(__dirname, projectPath, abilityType + '.js');
  }
}

module.exports = {
  deleteFolderRecursive: deleteFolderRecursive,
  readManifest: readManifest,
  loadEntryObj: loadEntryObj,
  compileCardModule: compileCardModule,
  hashProjectPath: hashProjectPath,
  checkMultiResourceBuild: checkMultiResourceBuild,
  multiResourceBuild: multiResourceBuild,
  readWorkerFile: readWorkerFile,
  compareCache: compareCache,
  systemModules: systemModules,
  parseAbilityName: parseAbilityName
};