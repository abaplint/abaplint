/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  entry: {
    cli: {
      import: "./build/src/cli.js",
      dependOn: "index",
    },
    index: "./build/src/index.js",
  },
  mode: "development",
  target: "node",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
  },
};