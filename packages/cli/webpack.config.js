/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  entry: {
    cli: {
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