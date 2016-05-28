
// Setup mocha
var TestBedMocha = require('test-bed/adapters/mocha')
TestBedMocha.setup()

// Setup power-assert
global.assert = require('power-assert')

// Setup TestBed
TestBedMocha.run({
  context: require.context('.', true, /\.spec\.js$/)
})
