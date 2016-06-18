const path = require('path')
const webpack = require('webpack')

module.exports = {
  devtool: 'source-map',
  entry: {
    'fps-measurer': './source/index.js'
  },
  output: {
    path: 'dist/umd',
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'FpsMeasurer'
  },
  externals: {
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      beautify: true,
      comments: true,
      mangle: false
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'source')
      }
    ]
  }
}
