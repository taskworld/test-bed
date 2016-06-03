'use strict'

const debug = require('debug')('test-bed:writeCoverageReport')

function writeCoverageReport (cache, done) {
  const istanbul = require('istanbul')
  const collector = new istanbul.Collector()
  const reporter = new istanbul.Reporter()
  for (const key of Object.keys(cache)) {
    for (const entry of cache[key]) {
      debug('Adding coverage data of %s -> %s', key, entry.test)
      collector.add(entry.snapshot)
    }
  }
  reporter.add('lcovonly')
  reporter.write(collector, false, done)
}

module.exports = writeCoverageReport
