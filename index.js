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
  .help()
  .argv

const config = require(require('path').resolve(process.cwd(), argv.config))
const server = require('./createServer')(config)

server.listen(argv.port, function () {
  console.log('')
  console.log('++====================================================++')
  console.log('|| test-bed is now running                            ||')
  console.log('||                                                    ||')
  console.log(`|| Please open http://localhost:${argv.port}/ in your browser ||`)
  console.log('|| in order to run tests.                             ||')
  console.log('++====================================================++')
  console.log('')
})
