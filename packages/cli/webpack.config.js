/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  entry: {
    index: {
      import: "./build/src/index.js",
    },
    cli: {
      dependOn: "index",
      import: "./build/src/cli.js",
    },
  },
  mode: "development",
  target: "node",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
  },
};