const overlay = require('webpack-hot-middleware/client-overlay')
const coverageCollector = require('./coverageCollector')

module.exports = (function () {
  var status = document.querySelector('#testbed-status')

  var maybeFrame = (function () {
    var _last = 0
    return function (f) {
      if (Date.now() - _last < 16) {
        f()
      } else {
        window.requestAnimationFrame(function () {
          _last = Date.now()
          f()
        })
      }
    }
  })()

  function updateStatus (content, f) {
    status.textContent = content
  }

  function loadTestFiles (files, onFinishLoading) {
    updateStatus('received ' + files.length + ' files.')
    requireFile(0, onFinishLoading)

    function requireFile (index, onFinish) {
      var current = files[index]
      maybeFrame(function () {
        if (current) {
          updateStatus('is requiring ' + current.name + ' (' + (index + 1) + '/' + files.length + ')...')
          try {
            current.fn()
          } catch (e) {
            updateStatus('failed to require ' + current.name + ': ' + e)
            throw e
          }
          maybeFrame(function () {
            requireFile(index + 1, onFinish)
          })
        } else {
          onFinish()
        }
      })
    }
  }

  function filterFiles (files, affectedModuleIds) {
    var filteredFiles = files.filter(function (file) {
      return affectedModuleIds.indexOf(file.id) >= 0
    })
    return filteredFiles.length ? filteredFiles : files
  }

  function error (message) {
    updateStatus('errored: ' + message)
    throw new Error(message)
  }

  window.TestBedSocket.on('compiled', function (result) {
    if (result.errors.length > 0) {
      overlay.showProblems('errors', result.errors)
    } else {
      window.sessionStorage.TestBedWebpackCompileResult = JSON.stringify(result)
      window.location.reload()
    }
  })

  return {
    run: function (options) {
      if (typeof options.runTests !== 'function') {
        error('Required: options.runTests')
      }
      if (typeof options.context !== 'function') {
        error('Required: options.context')
      }
      var wrapRequire = options.wrapRequire || function (name, doRequire) {
        doRequire()
      }

      var files = getSpecFilesFromContext(options.context)
      var affectedModuleIds = getAffectedModuleIdsFromLastRun()
      var filteredFiles = filterFiles(files, affectedModuleIds)
      var filesStatString = filteredFiles.length + (filteredFiles.length < files.length ? ' affected' : '') + ' spec files'

      if (filteredFiles.length < files.length) {
        addAction('run all', function () {
          window.sessionStorage.TestBedWebpackCompileResult = ''
          window.location.reload()
        })
      }

      loadTestFiles(filteredFiles, function () {
        updateStatus('started running ' + filesStatString)
        const promise = options.runTests()
        if (typeof promise.then !== 'function') {
          updateStatus('warns: options.runTests() did not return a promise')
          return
        }
        promise.then(
          function () {
            updateStatus('ran ' + filesStatString)
            sendCoverageReport()
          },
          function (e) {
            updateStatus('finished test with error: ' + String(e))
          }
        )
      })

      function getSpecFilesFromContext (context) {
        var files = [ ]
        context.keys().forEach(function (key) {
          files.push({
            name: key,
            fn: function () {
              wrapRequire(key, function () {
                context(key)
              })
            },
            id: context.resolve(key)
          })
        })
        return files
      }

      function getAffectedModuleIdsFromLastRun () {
        const lastRunResult = (function () {
          try { return JSON.parse(window.sessionStorage.TestBedWebpackCompileResult) } catch (e) { return null }
        })()
        if (!lastRunResult) return [ ]
        return lastRunResult.affectedModuleIds || [ ]
      }

      function addAction (text, onClick) {
        var link = document.createElement('a')
        link.href = 'javascript://runAll'
        link.textContent = 'run all'
        link.onclick = onClick
        document.getElementById('testbed-actions').appendChild(link)
      }

      function sendCoverageReport () {
        var collectedData = coverageCollector.finalizeAndReturnCollectedCoverageData()
        window.TestBedSocket.emit('coverage', {
          files: files.map(function (file) { return file.name }),
          collectedData: collectedData
        })
      }
    },

    fileStarted: function (key) {
      coverageCollector.fileStarted(key)
    },

    fileEnded: function (key) {
      coverageCollector.fileEnded(key)
    },

    testStarted: function (key) {
      coverageCollector.testStarted(key)
    },

    testEnded: function (key) {
      coverageCollector.testEnded(key)
    }
  }
})()
