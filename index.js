#!/usr/bin/env node
'use strict'

const DEFAULT_PORT = 9011

const argv = require('yargs')
  .option('c', {
    alias: 'config',
    default: 'webpack.config.test-bed.js',
    describe: 'Specify the configuration file',
    nargs: 1,
    type: 'string'
  })
  .option('p', {
    alias: 'port',
    describe: `Specify the port (defaults to ${DEFAULT_PORT})`,
    nargs: 1,
    type: 'number'
  })
  .option('b', {
    alias: 'browser',
    default: undefined,
    describe: 'Specify if the system\'s default browser should be opened automatically (overrides settings in webpack config)',
    nargs: 1,
    type: 'boolean'
  })
  .help()
  .argv

const config = require(require('path').resolve(process.cwd(), argv.config))
const shouldOpenBrowser = getShouldOpenBrowser(argv, config)
const port = getPort(argv, config)
const server = require('./createServer')(config)

server.listen(port, function () {
  const actualPort = server.address().port
  const portNumberPadding = ' '.repeat(5 - String(actualPort).length)
  console.log('')
  console.log('++=====================================================++')
  console.log('|| test-bed is now running                             ||')
  console.log('||                                                     ||')
  if (shouldOpenBrowser) {
    console.log('|| If your browser does not open automatically, visit  ||')
    console.log(`|| http://localhost:${actualPort}/ in order to run tests.      ${portNumberPadding}||`)
  } else {
    console.log(`|| Please open http://localhost:${actualPort}/ in your browser ${portNumberPadding}||`)
    console.log('|| in order to run tests.                              ||')
  }
  console.log('++=====================================================++')
  console.log('')
  shouldOpenBrowser && require('opn')(`http://localhost:${actualPort}/`)
})

function getPort(argv, config) {
  if (argv.port !== undefined) {
    return argv.port
  }
  if (config.testBed && (config.testBed.port !== undefined)) {
    return config.testBed.port
  }
  return DEFAULT_PORT
}

function getShouldOpenBrowser(argv, config) {
  if (argv.browser !== undefined) {
    return argv.browser
  }
  return config.testBed && config.testBed.openBrowser
}
