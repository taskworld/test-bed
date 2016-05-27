require('!!style-loader!raw-loader!./test-bed.css')
require('!!webpack-hot-middleware/client?reload')

window.TestBed = (function () {
  var _cache
  var _run
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

  function saveCache (files) {
    var cache = { }
    files.forEach(function (file) {
      cache[file.name] = file.fn
    })
    _cache = cache
  }

  function go (files) {
    if (_cache) {
      var changedFiles = files.filter(function (file) {
        return _cache[file.name] !== file.fn
      })
      updateStatus('received ' + changedFiles.length + ' changed files.')
      rerun(changedFiles)
    } else {
      saveCache(files)
      updateStatus('received ' + files.length + ' files.')
      var filteredFiles = filterFiles(files)
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
        if (_run) {
          _run()
        } else {
          error('Not properly setup. Please call TestBed.setup().')
        }
      })
    }
  }

  function rerun (files) {
    var nextFiles = (files.map(function (file) {
      return file.name
    }).join(';;'))
    window.sessionStorage.testFiles = nextFiles
    window.location.reload()
  }

  function filterFiles (files) {
    var filter = window.sessionStorage.testFiles || ''
    if (!filter) return files
    var applicable = filter.split(';;')
    var filteredFiles = files.filter(function (file) {
      return applicable.indexOf(file.name) >= 0
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

  return {
    setup: function (options) {
      if (typeof options.run !== 'function') {
        error('Required: options.run')
      }
      _run = options.run
    },
    receiveContext: function (context) {
      console.log('Receiving context...', context)
      var files = [ ]
      context.keys().forEach(function (key) {
        files.push({ name: key, fn: context(key) })
      })
      go(files)
    }
  }
})()
