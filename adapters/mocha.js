'use strict'
/* global mocha, describe, before, after */

exports.setup = function (options) {
  options = options || { ui: 'bdd' }

  // Create an element for Mocha.
  var mochaElement = document.createElement('div')
  mochaElement.id = 'mocha'
  document.body.appendChild(mochaElement)

  // Require browser version of Mocha.
  require('!!script!mocha/mocha.js')
  require('!!style!raw!mocha/mocha.css')

  // Set up the interfaces.
  mocha.setup(options)
}

exports.run = function (options) {
  var context = options.context
  var TestBed = require('../src/test-bed')

  TestBed.run({
    context: context,

    // This function is called when test-bed finished loading all dependencies.
    runTests: function () {
      return new Promise(function (resolve) {
        var runner = mocha.run(resolve)
        var _testing = false

        // Listen to 'test' and 'test end' events and report to test-bed to
        // capture code coverage data.
        runner.on('suite', function (suite) {
          if (suite._testBedKey) {
            TestBed.fileStarted(suite._testBedKey)
          }
        })
        runner.on('suite end', function (suite) {
          if (suite._testBedKey) {
            TestBed.fileEnded(suite._testBedKey)
          }
        })
        runner.on('test', function (test) {
          _testing = true
          TestBed.testStarted(test.fullTitle())
        })
        runner.on('test end', function (test) {
          if (!_testing) return
          _testing = false
          TestBed.testEnded(test.fullTitle())
        })
      })
    },

    // This function is called when test-bed wants to `require()` a test file.
    //
    // * `key` is the test file name.
    // * `doRequire` is a function that, when called, will require that test file.
    //
    // This function should be used synchronously.
    //
    wrapRequire: function (key, doRequire) {
      describe(key, function () {
        this._testBedKey = key
        doRequire()
      })
    }
  })
}
