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

import RawSource from 'webpack-sources/lib/RawSource';

const path = require('path');
const { Compilation } = require('webpack');

const moduleReg = /(@ohos|@system)(\.[a-zA-Z]+)+/g;

class ModuleCollectionPlugin {
  constructor() {
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('rich', (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'MyPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_REPOR,
        },
        (assets, back) => {
          const keys = Object.keys(assets);
          const moduleList = [];
          keys.forEach(key => {
            const extName = path.extname(key);
            if (extName === '.js') {
              const source = assets[key].source();
              const moduleName = source.match(moduleReg);
              if (moduleName) {
                moduleName.forEach(function(item) {
                  moduleList.push(item.replace('@', ''));
                });
              }
            }
          });
          compilation.assets['./module_collection.txt'] =
            new RawSource(moduleList.length === 0 ? 'NULL' : moduleList.join(','));
          back && back();
        },
      );
    });
  }
}
  
module.exports = ModuleCollectionPlugin;
