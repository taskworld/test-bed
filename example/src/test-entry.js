
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
TestBed.setup({
  run () {
    mocha.run()
  }
})

// Send test context to TestBed and enable hot reloading
TestBed.receiveContext(require('./test-context'))
module.hot.accept('./test-context', function () {
  TestBed.receiveContext(require('./test-context'))
})
