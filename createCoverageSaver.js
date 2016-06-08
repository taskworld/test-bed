'use strict'

module.exports = function createCoverageSaver () {
  const debug = require('debug')('test-bed:coverageSaver')
  const cache = { }

  function receiveReport (report) {
    pruneCacheEntriesNotInFiles()
    storeCoverageData()
    writeCoverageReport()

    function pruneCacheEntriesNotInFiles () {
      const files = report.files
      for (const key of Object.keys(cache)) {
        if (key === '(runtime)') continue
        if (files.indexOf(key) === -1) {
          debug('Pruning cache for: %s.', key)
          delete cache[key]
        }
      }
    }

    function storeCoverageData () {
      const collectedData = report.collectedData
      for (const key of Object.keys(collectedData)) {
        debug('Storing coverage data for: %s.', key)
        cache[key] = collectedData[key]
      }
    }
  }

  function writeCoverageReport () {
    const reportWriter = require('child_process').fork(require.resolve('./coverageReportWriter'))
    reportWriter.send(cache)
  }

  return { receiveReport }
}
