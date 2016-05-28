'use strict'
const path = require('path')

// HACK: Force Babel into test env.
process.env.BABEL_ENV = 'test'

module.exports = {
  entry: './src/test-entry.js',
  resolve: {
    alias: {
      'test-bed$': path.resolve(__dirname, '../src/test-bed.js'),
      'test-bed': path.resolve(__dirname, '..')
    }
  },
  module: {
    loaders: [
      {
        include: path.resolve(__dirname, 'src'),
        test: /\.js$/,
        loader: 'babel'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
}
