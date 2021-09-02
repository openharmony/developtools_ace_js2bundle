/*
 * Copyright (c) 2020 Huawei Device Co., Ltd.
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

const red = '\u001b[31m';
const reset = '\u001b[39m';

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

function readManifest(manifestFilePath) {
  let manifest = {};
  try {
    const jsonString = fs.readFileSync(manifestFilePath).toString()
    manifest = JSON.parse(jsonString)
  } catch (e) {
    throw Error('\u001b[31m' + 'ERROR: the manifest file is lost or format is invalid.' + '\u001b[39m').message
  }
  return manifest;
}

function loadEntryObj(projectPath, device_level, abilityType, manifestFilePath) {
  let entryObj = {}
  switch (abilityType) {
    case 'page':
      const appJSPath = path.resolve(projectPath, 'app.js');
      if (device_level === 'card') {
        entryObj = addPageEntryObj(readManifest(manifestFilePath), projectPath);
      } else {
        if (!fs.existsSync(appJSPath)) {
          throw Error(red + 'ERROR: missing app.js' + reset).message;
        }
        entryObj['./app'] = projectPath + '/app.js?entry';
      }
      break;
    case 'data':
      entryObj['./data'] = projectPath + '/data.js?entry';
      break
    case 'service':
      entryObj['./service'] = projectPath + '/service.js?entry';
      break
  }
  return entryObj;
}

function addPageEntryObj(manifest, projectPath) {
  let entryObj = {};
  const pages = manifest.pages;
  if (pages === undefined) {
    throw Error('ERROR: missing pages').message;
  }
  pages.forEach((element) => {
    entryObj['./' + element] = projectPath + path.sep + element + '.hml?entry'
  })
  return entryObj;
}

module.exports = {
  deleteFolderRecursive: deleteFolderRecursive,
  readManifest: readManifest,
  loadEntryObj: loadEntryObj
};
