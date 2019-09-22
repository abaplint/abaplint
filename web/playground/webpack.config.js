var path = require('path');

module.exports = {
  entry: {
    "app": './build/index.js',
    "editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
  },
  mode: 'development',
  output: {
    path: __dirname + '/build/',
		globalObject: 'self',
		filename: '[name].bundle.js',
    publicPath: './build/'
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.png$/, use: 'file-loader' }
    ]
  }
};
