#!/usr/bin/env node
'use strict'

const config = require(require('path').resolve(process.cwd(), 'webpack.config.test-bed.js'))
const server = require('./createServer')(config)

server.listen(9011, function () {
  console.log('')
  console.log('++====================================================++')
  console.log('|| test-bed is now running                            ||')
  console.log('||                                                    ||')
  console.log('|| Please open http://localhost:9011/ in your browser ||')
  console.log('|| in order to run tests.                             ||')
  console.log('++====================================================++')
  console.log('')
})
