const path = require('path');

module.exports = {
  entry: "./build/src/cli/cli.js",
  mode: "development",
  target: "node",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
  },
};