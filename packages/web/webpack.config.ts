import * as Webpack from 'webpack';
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

const config: Webpack.Configuration = {
  entry: './src/index.tsx',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    path: path.join(__dirname, '/build'),
    filename: 'bundle.min.js',
  },
  module: {
    rules: [
      {
        test: /\.ts|\.tsx$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        include: path.resolve(__dirname, 'src'),
        use: 'ts-loader',
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
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
