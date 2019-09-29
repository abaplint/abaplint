const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

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
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'shared', // may be suboptimal for production due to big chunk size
    },
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
      { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
      { 
        test: /\.png$/,
        include: /favicon/,
        use: 'file-loader?name=[name].[ext]'
      },
      { 
        test: /\.png$|\.svg$/,
        exclude: /favicon/,
        use: 'url-loader?limit=1024',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    })
  ],
});
