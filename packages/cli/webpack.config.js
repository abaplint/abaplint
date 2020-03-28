/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  entry: "./build/src/cli.js",
  mode: "development",
  target: "node",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
  },
};