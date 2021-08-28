"use strict";
var path = require("path");
var fs = require("fs");
let exec = require('child_process').exec;

if ( !fs.existsSync(path.resolve(path.join(__dirname, 'bin'), "ark"))) return;

var build_linux = path.join(__dirname, "bin", "ark", "build");
var build_win = path.join(__dirname, "bin", "ark", "build-win");
var build_mac = path.join(__dirname, "bin", "ark", "build-mac");

var isWin = !1;
var isMac = !1;

if (fs.existsSync(path.resolve(path.join(__dirname, 'bin'), "ark/build-win"))) {
    isWin = !0;
} else if (fs.existsSync(path.resolve(path.join(__dirname, 'bin'), "ark/build-mac"))) {
    isMac = !0;
} else if (!fs.existsSync(path.resolve(path.join(__dirname, 'bin'), "ark/build"))) {
    throw Error("Error: find build fail").message;
}

let cwd;
if (isWin) {
    cwd = build_win
} else if (isMac) {
    cwd = build_mac
} else {
    cwd = build_linux
}

exec("npm install", { cwd: cwd }, function (err, stdout, stderr) {
    console.log("[31m", stdout, "[39m");
    if (err != null) {
        throw Error(`npm install filed: ${err}`).message;
    }
});