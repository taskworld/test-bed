
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
    mocha.run((err) => resolve())
  })
})
