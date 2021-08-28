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

const fs = require('fs')
const path = require('path')

let output = ''
const initIndexJSONObject = { "template": {}, "styles": {}, "actions": {},"data":{} }

function compileJson(compiler, type, filePath, content, contentType, elementType) {
  compiler.hooks.done.tap(type + contentType, () => {
    if (type === 'init') {
      writeFileSync(filePath, initIndexJSONObject)
    } else {
      writeFileSync(filePath, content, contentType, elementType)
    }
  })
}

function writeFileSync(filePath, content, contentType, elementType) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, stringify(content))
  } else {
    const fileContent = fs.readFileSync(filePath, {encoding:'utf-8'})
    try {
      const jsonContent = JSON.parse(fileContent)
      if (contentType && !elementType) {
        jsonContent[contentType] = content ? content : {}
        fs.writeFileSync(filePath, stringify(jsonContent))
      } else if (contentType && elementType) {
        if (!jsonContent[contentType]) {
          jsonContent[contentType] = {}
        }
        jsonContent[contentType][elementType] = content ? content : {}
        fs.writeFileSync(filePath, stringify(jsonContent))
      }
    } catch (e) {
      fs.writeFileSync(filePath, stringify(initIndexJSONObject))
      writeFileSync(filePath, content, contentType)
    }
  }
}

function stringify (jsonObect) {
  return JSON.stringify(jsonObect, null, 2)
}

class AfterEmitPlugin {
  constructor(output_) {
    output = output_
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('delete', (compilation) => {
      const assets = compilation.assets
      const keys = Object.keys(assets)
      keys.forEach(key => {
        if (fs.existsSync(path.resolve(output, key))) {
          if (key.indexOf('i18n') !== 0) {
            fs.unlinkSync(path.resolve(output, key))
          }
        }
      })
    })
  }
}

module.exports = {
  compileJson: compileJson,
  AfterEmitPlugin: AfterEmitPlugin
}
