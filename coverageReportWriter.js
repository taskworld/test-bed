'use strict'

const debug = require('debug')('test-bed:coverageReportWriter')

process.on('message', function (cache) {
  debug('Received cache from parent process.')
  require('./writeCoverageReport')(cache, function () {
    debug('Done')
    process.exit(0)
  })
})

debug('Initialized')
