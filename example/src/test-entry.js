
// Setup mocha
{
  const mochaElement = document.createElement('div')
  mochaElement.id = 'mocha'
  document.body.appendChild(mochaElement)

  require('script!mocha/mocha.js')
  require('style!css!mocha/mocha.css')

  mocha.setup({ ui: 'bdd' })
}

// Setup power-assert
{
  global.assert = require('power-assert')
}

// Setup TestBed
TestBed.run({
  context: require.context('.', true, /\.spec\.js$/),
  runTests: () => new Promise((resolve, reject) => {
    const runner = mocha.run((err) => resolve())
    let _testing = false
    runner.on('test', function (test) {
      _testing = true
      TestBed.testStarted(test.fullTitle())
    })
    runner.on('test end', function (test) {
      if (!_testing) return
      _testing = false
      TestBed.testEnded(test.fullTitle())
    })
  }),
  wrapRequire (key, doRequire) {
    describe(key, function () {
      before(function () {
        TestBed.fileStarted(key)
      })
      doRequire()
    })
  }
})
