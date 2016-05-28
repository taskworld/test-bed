
module.exports = function createCoverageSaver () {
  const cache = { }

  function receiveReport (report) {
    pruneCacheEntriesNotInFiles()
    storeCoverageData()
    writeCoverageReport()

    function pruneCacheEntriesNotInFiles () {
      const files = report.files
      for (const key of Object.keys(cache)) {
        if (key === '(runtime)') continue
        if (files.indexOf(key) === -1) delete cache[key]
      }
    }

    function storeCoverageData () {
      const collectedData = report.collectedData
      for (const key of Object.keys(collectedData)) {
        cache[key] = collectedData[key]
      }
    }
  }

  function writeCoverageReport () {
    const istanbul = require('istanbul')
    const collector = new istanbul.Collector()
    const reporter = new istanbul.Reporter()
    for (const key of Object.keys(cache)) {
      for (const entry of cache[key]) {
        // console.log('Adding coverage data of %s -> %s', key, entry.test)
        collector.add(entry.snapshot)
      }
    }
    reporter.add('lcovonly')
    reporter.write(collector, false, function () {
      // saved coverage report!!!
    })
  }

  return { receiveReport }
}
