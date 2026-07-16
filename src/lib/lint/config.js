"use strict";

const configGql = require("./configs/config-gql");
const configTs = require("./configs/config-ts");
const configAll = require("./configs/config-all");
const configReact = require("./configs/config-react");
const configIgnores = require("./configs/config-ignores");

module.exports = [
  configIgnores,
  configAll,
  configReact,
  configTs,
  configGql,
];
