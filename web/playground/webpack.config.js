const path = require('path');

module.exports = ({ mode } = { mode: 'development' }) => ({
  entry: {
    "app": './src/index.ts',
    "editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
    "json.worker": 'monaco-editor/esm/vs/language/json/json.worker.js',
  },
  mode,
  output: {
    path: path.join(__dirname, 'build'),
		filename: '[name].bundle.js',
		globalObject: 'self',
    publicPath: '/'
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    inline: true,
    hot: true,
    open: true,
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
      { test: /\.png$/, use: 'file-loader' },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  }
});
