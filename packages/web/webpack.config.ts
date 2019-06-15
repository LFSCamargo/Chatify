import * as Webpack from 'webpack';
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

const config: Webpack.Configuration = {
  entry: './src/index.tsx',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.min.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: './src/public/index.html',
    }),
  ],
};

module.exports = config;
