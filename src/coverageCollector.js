var _currentFile = '(runtime)'
var _currentTest = '(runtime)'
var _snapshots = { }

function takeCoverageDataSnapshot (coverageData) {
  var snapshot = { }
  var _empty = true
  for (var fileName in coverageData) {
    if (!isFileCoverageEmpty(coverageData[fileName])) {
      snapshot[fileName] = JSON.parse(JSON.stringify(coverageData[fileName]))
      _empty = false
    }
  }
  if (_empty) return null
  return snapshot
}

function clearCoverageData (coverageData) {
  for (var fileName in coverageData) {
    clearCoverageFileData(coverageData[fileName])
  }
}

function clearCoverageFileData (fileData) {
  var id
  for (id in fileData.s) {
    fileData.s[id] = 0
  }
  for (id in fileData.b) {
    var a = fileData.b[id]
    for (var i = 0; i < a.length; i++) a[i] = 0
  }
  for (id in fileData.f) {
    fileData.f[id] = 0
  }
}

function isFileCoverageEmpty (fileData) {
  var id
  for (id in fileData.s) {
    if (fileData.s[id] > 0) return false
  }
  for (id in fileData.b) {
    if (fileData.b[id].reduce(sum, 0) > 0) return false
  }
  for (id in fileData.f) {
    if (fileData.f[id] > 0) return false
  }
  return true
}

function sum (a, b) {
  return a + b
}

function createCoverageDataHandler (f) {
  return function () {
    if (global.__coverage__) return f(global.__coverage__).apply(this, arguments)
  }
}

var doSwitch = createCoverageDataHandler(function (coverageData) {
  return function (file, test) {
    var snapshot = takeCoverageDataSnapshot(coverageData)
    if (snapshot) {
      clearCoverageData(coverageData)
      var storage = _snapshots[_currentFile] || (_snapshots[_currentFile] = [ ])
      var newData = { test: _currentTest, snapshot: snapshot }
      storage.push(newData)
      // console.log('Collected:', _currentFile, _currentTest, snapshot)
    }
    _currentFile = file
    _currentTest = test
  }
})

exports.fileStarted = function (key) {
  doSwitch(key, _currentTest)
}

exports.fileEnded = function () {
  doSwitch('(runtime)', _currentTest)
}

exports.testStarted = function (testName) {
  doSwitch(_currentFile, testName)
}

exports.testEnded = function () {
  doSwitch(_currentFile, '(runtime)')
}

exports.finalizeAndReturnCollectedCoverageData = function () {
  doSwitch('(runtime)', '(runtime)')
  return _snapshots
}
