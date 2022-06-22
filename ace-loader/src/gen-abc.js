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
const childProcess = require('child_process');
const cluster = require('cluster');

function js2abcByWorkers(jsonInput, cmd) {
  const inputPaths = JSON.parse(jsonInput);
  for (let i = 0; i < inputPaths.length; ++i) {
    let input = inputPaths[i].path;
    let singleCmd = `${cmd} "${input}"`;
    childProcess.execSync(singleCmd);

    if (fs.existsSync(input)) {
      fs.unlinkSync(input);
    }

    const abcFile = input.replace(/\.js$/, '.abc');
    if (fs.existsSync(abcFile)) {
      const abcFileNew = abcFile.replace(/_.abc$/, '.abc');
      fs.copyFileSync(abcFile, abcFileNew);
      fs.unlinkSync(abcFile);
    }
  }
}

if (cluster.isWorker && process.env["inputs"] !== undefined && process.env["cmd"] !== undefined) {
  js2abcByWorkers(process.env["inputs"], process.env["cmd"]);
  process.exit();
}
