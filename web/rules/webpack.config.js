/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  mode: "none",
  entry: {
    pack: "./src/pack.ts",
  },
  resolve: {
    fallback: {
      "crypto": false,
      /*
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "http": false,
      "https": false,
      "zlib": false,
      "util": false,
      "url": false,
      "string_decoder": require.resolve("string_decoder/"),
      */
    },
    extensions: [".ts", ".js"],
    alias: {
    },
  },
  output: {
    globalObject: "self",
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
  ],
};
