const overlay = require('webpack-hot-middleware/client-overlay')

window.TestBed = (function () {
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
    if (f) f(status)
  }

  function loadTestFiles (files, affectedModuleIds, runTests) {
    updateStatus('received ' + files.length + ' files.')
    var filteredFiles = filterFiles(files, affectedModuleIds)
    requireFile(filteredFiles, 0, function () {
      updateStatus('ran ' + filteredFiles.length + (filteredFiles.length < files.length ? ' affected' : '') + ' spec files. ', function (el) {
        if (filteredFiles.length < files.length) {
          var link = document.createElement('a')
          link.href = 'javascript://runAll'
          link.textContent = 'run all'
          link.onclick = function () {
            window.sessionStorage.testFiles = ''
            window.location.reload()
          }
          el.appendChild(link)
        }
      })
      runTests()
    })
  }

  function filterFiles (files, affectedModuleIds) {
    var filteredFiles = files.filter(function (file) {
      return affectedModuleIds.indexOf(file.id) >= 0
    })
    return filteredFiles.length ? filteredFiles : files
  }

  function requireFile (files, index, onFinish) {
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
          requireFile(files, index + 1, onFinish)
        })
      } else {
        onFinish()
      }
    })
  }

  function error (message) {
    updateStatus('errored: ' + message)
    throw new Error(message)
  }

  window.TestBedSocket.on('compiled', (result) => {
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

      var files = getSpecFilesFromContext(options.context)
      var affectedModuleIds = getAffectedModuleIdsFromLastRun()

      loadTestFiles(files, affectedModuleIds, () => {
        options.runTests()
      })

      function getSpecFilesFromContext (context) {
        var files = [ ]
        context.keys().forEach(function (key) {
          files.push({ name: key, fn: () => context(key), id: context.resolve(key) })
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
    }
  }
})()
