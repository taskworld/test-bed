#!/usr/bin/env node
'use strict'

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
    default: 9011,
    describe: 'Specify the port',
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
const openBrowser = argv.browser !== undefined ? argv.browser : config.testBed && config.testBed.openBrowser
const server = require('./createServer')(config)

server.listen(argv.port, function () {
  console.log('')
  console.log('++====================================================++')
  console.log('|| test-bed is now running                            ||')
  console.log('||                                                    ||')
  if (openBrowser) {
    console.log('|| If your browser does not open automatically, visit ||')
    console.log(`|| http://localhost:${argv.port}/ in order to run tests.      ||`)
  } else {
    console.log(`|| Please open http://localhost:${argv.port}/ in your browser ||`)
    console.log('|| in order to run tests.                             ||')
  }
  console.log('++====================================================++')
  console.log('')
  openBrowser && require('opn')(`http://localhost:${argv.port}/`)
})
