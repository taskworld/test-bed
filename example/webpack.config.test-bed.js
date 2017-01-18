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
        loader: 'babel-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  // Override webpack middleware default settings
  webpackMiddleware: {
    quiet: false
  },
  testBed: {
    // Change this to false or remove this line to prevent your system browser from launching
    openBrowser: true,
    // Overrides the default port of 9011; 0 instructs test-bed to automatically find a free port
    port: 9012,
    // Optional! You can use things like `express.static()`.
    configureExpressApp: function (app, express) {
      void express
      app.use(function (req, res, next) {
        console.log('Request received:', req.url)
        next()
      })
    }
  }
}
