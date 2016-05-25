
module.exports = function () {
}

module.exports.pitch = function (remainingRequest) {
  return (
    'module.exports = function () {' +
      'return require(' + JSON.stringify('!!' + remainingRequest) + ')' +
    '}'
  )
}
