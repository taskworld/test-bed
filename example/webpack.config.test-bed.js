'use strict'
const path = require('path')

module.exports = {
  entry: './src/test-entry.js',
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
