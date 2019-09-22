const path = require('path');

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
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    alias: {
    'abaplint': path.resolve(__dirname, '../../build/src/'),
    }
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.png$/, use: 'file-loader' }
    ]
  }
};
