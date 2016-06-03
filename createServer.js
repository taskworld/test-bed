#!/usr/bin/env node
'use strict'

const path = require('path')
const createCoverageSaver = require('./createCoverageSaver')

function createCompiler (inConfig) {
  const debug = require('debug')('test-bed:compiler')
  const webpack = require('webpack')
  const config = Object.assign({ }, inConfig)

  const OccurrenceOrderPlugin = webpack.optimize.OccurrenceOrderPlugin
  const NoErrorsPlugin = webpack.NoErrorsPlugin
  const plugins = (config.plugins || [ ]).slice()

  ensurePlugin(OccurrenceOrderPlugin)
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
    if (plugins.some(plugin => plugin instanceof Plugin)) {
      debug('%s already exists in webpack configuration, skipping.', Plugin.name)
    } else {
      debug('Adding %s to configuration.', Plugin.name)
      plugins.push(new Plugin())
    }
  }

  return webpack(config)
}

module.exports = function createServer (config) {
  const debug = require('debug')('test-bed:server')
  const debugSocket = require('debug')('test-bed:socket')
  const express = require('express')
  const app = express()
  const server = require('http').createServer(app)
  const io = require('socket.io')(server)
  const compiler = createCompiler(config)
  const coverageSaver = createCoverageSaver()

  app.use(express.static(path.resolve(__dirname, 'static')))

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: '/test-assets/',
    stats: { colors: true }
  }))

  io.on('connection', function (socket) {
    debugSocket('Client connected')
    function saveCoverage (report) {
      coverageSaver.receiveReport(report)
    }
    function onDisconnected () {
      socket.removeListener('coverage', saveCoverage)
      socket.removeListener('disconnect', onDisconnected)
      debugSocket('Client disconnected')
    }
    socket.on('coverage', saveCoverage)
    socket.on('disconnect', onDisconnected)
  })

  compiler.plugin('done', function (stats) {
    const compilation = stats.compilation
    const builtModules = findBuiltModules()
    const affectedModuleIds = calculateAffectedModuleIds(builtModules)
    const errors = stats.toJson().errors || [ ]
    debug('Built modules: %o', builtModules.map(builtModule => builtModule.id))
    debug('Affected modules: %o', affectedModuleIds)

    io.emit('compiled', {
      affectedModuleIds,
      errors
    })

    function calculateAffectedModuleIds (modules) {
      const visited = { }
      const affectedModuleIds = [ ]
      for (let moduleToTraverse of modules) {
        traverse(moduleToTraverse)
      }
      return affectedModuleIds
      function traverse (moduleToTraverse) {
        const id = moduleToTraverse.id
        if (visited[id]) return
        visited[id] = true
        affectedModuleIds.push(id)
        const parents = (moduleToTraverse.reasons
          .filter(reason => reason.dependency && reason.module)
          .map(reason => reason.module)
        )
        for (let parent of parents) traverse(parent)
      }
    }

    function findBuiltModules () {
      const built = [ ]
      for (let chunk of compilation.chunks) {
        built.push.apply(built, chunk.modules.filter(module => module.built))
      }
      return built
    }
  })

  return server
}
