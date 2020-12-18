#!/usr/bin/env node

"use strict";

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split(".");
var major = semver[0];

if (major < 10) {
  console.error(
    "You are running Node " +
      currentNodeVersion +
      ".\n" +
      "bsfe-cli requires Node 10 or higher. \n" +
      "Please update your version of Node."
  );
  process.exit(1);
}

const { init } = require("../src/index");

init();
