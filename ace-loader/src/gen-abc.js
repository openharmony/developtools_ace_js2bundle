/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
const SUCCESS = 0;
const FAIL = 1;
const red = '\u001b[31m';
const reset = '\u001b[39m';

function js2abcByWorkers(jsonInput, cmd) {
  const inputPaths = JSON.parse(jsonInput);
  for (let i = 0; i < inputPaths.length; ++i) {
    let input = inputPaths[i].path;
    let sourceFile = inputPaths[i].path.replace(/\.temp\.js$/, "_.js");
    let abcFilePath = inputPaths[i].path.replace(/\.temp\.js$/, ".abc");
    let singleCmd = `${cmd} "${input}" -o "${abcFilePath}" --source-file "${sourceFile}"`;
    try {
      childProcess.execSync(singleCmd);
    } catch (e) {
      console.debug(red, `ETS:ERROR Failed to convert file ${input} to abc `, reset);
      process.exit(FAIL);
    }
  }
}

if (cluster.isWorker && process.env["inputs"] !== undefined && process.env["cmd"] !== undefined) {
  js2abcByWorkers(process.env["inputs"], process.env["cmd"]);
  process.exit(SUCCESS);
}
