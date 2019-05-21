const webpack = require('webpack');
const path = require('path');
const autoReload = require('auto-reload-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  target: 'node',
  watch: true,
  entry: {
    server: ['webpack/hot/poll?1000', './src/server.ts'],
  },
  stats: {
    warnings: false
  },
  node: {
    __filename: false,
    __dirname: false,
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
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000'],
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve('build'),
  },
  plugins: [
    new autoReload({
      filePath: 'build/server.js',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};
