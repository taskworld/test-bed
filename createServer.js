#!/usr/bin/env node
'use strict'

const path = require('path')

function createCompiler (inConfig) {
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

  app.use(express.static(path.resolve(__dirname, 'static')))

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: '/test-assets/',
    stats: { colors: true }
  }))

  compiler.plugin('done', function (stats) {
    const compilation = stats.compilation
    const builtModules = findBuiltModules()
    const affectedModuleIds = calculateAffectedModuleIds(builtModules)
    const errors = stats.toJson().errors || [ ]

    io.emit('compiled', {
      affectedModuleIds,
      errors
    })

    io.on('connection', function (socket) {
      socket.on('coverage', function (coverageData) {
        const istanbul = require('istanbul')
        const collector = new istanbul.Collector()
        const reporter = new istanbul.Reporter()
        collector.add(coverageData)
        reporter.add('lcovonly')
        reporter.write(collector, false, function () {
          // saved coverage report!!!
        })
      })
    })

    function calculateAffectedModuleIds (modules) {
      const visited = { }
      const affectedModuleIds = [ ]
      for (const moduleToTraverse of modules) {
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
        for (const parent of parents) traverse(parent)
      }
    }

    function findBuiltModules () {
      const built = [ ]
      for (const chunk of compilation.chunks) {
        built.push(...chunk.modules.filter(module => module.built))
      }
      return built
    }
  })

  return server
}
