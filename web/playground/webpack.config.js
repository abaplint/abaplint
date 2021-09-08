/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = ({mode} = {mode: "development"}) => ({
  entry: {
    "app": "./src/index.ts",
    "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
    "json.worker": "monaco-editor/esm/vs/language/json/json.worker.js",
  },
  mode,
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js",
    globalObject: "self",
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    open: true,
    hot: true,
    inline: true,
  },
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
    },
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {test: /\.css$/, use: ["style-loader", "css-loader"]},
      {test: /\.less$/, use: ["style-loader", "css-loader", "less-loader"]},
      {
        test: /\.png$/,
        include: /favicon/,
        use: "file-loader?name=[name].[ext]",
      },
      {
        test: /\.png$|\.svg$/,
        exclude: /favicon/,
        use: "url-loader?limit=1024",
      },
      {
        test: /\.ttf$/,
        type: "asset/resource",
        generator: {
          filename: "[name][ext]",
        },
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
  ],
});
