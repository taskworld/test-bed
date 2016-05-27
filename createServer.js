#!/usr/bin/env node
'use strict'

function createCompiler (inConfig) {
  const webpack = require('webpack')
  const path = require('path')
  const config = Object.assign({ }, inConfig)

  const OccurrenceOrderPlugin = webpack.optimize.OccurrenceOrderPlugin
  const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin
  const NoErrorsPlugin = webpack.NoErrorsPlugin
  const plugins = (config.plugins || [ ]).slice()

  ensurePlugin(OccurrenceOrderPlugin)
  ensurePlugin(HotModuleReplacementPlugin)
  ensurePlugin(NoErrorsPlugin)

  if (typeof config.entry !== 'string') {
    throw new Error('config.entry should be a string.')
  }

  config.entry = [
    '!!' + require.resolve('./src/test-bed'),
    config.entry
  ]

  if (config.output) {
    console.warn('[test-bed]: Replacing config.output with test-bed’s configuration.')
  }
  config.output = {
    path: path.resolve(process.cwd(), 'build/test-assets'),
    publicPath: '/test-assets/',
    filename: 'test.bundle.js'
  }

  config.devTool = 'cheap-eval-module-source-map'

  config.plugins = plugins

  function ensurePlugin (Plugin) {
    if (!plugins.some(plugin => plugin instanceof Plugin)) {
      plugins.push(new Plugin())
    }
  }

  return webpack(config)
}

module.exports = function createServer (config) {
  const express = require('express')
  const app = express()
  const server = require('http').createServer(app)
  const io = require('socket.io')(server)
  const compiler = createCompiler(config)

  app.use(express.static(__dirname + '/static'))

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: '/test-assets/',
    stats: { colors: true }
  }))

  app.use(require('webpack-hot-middleware')(compiler))

  return server
}
