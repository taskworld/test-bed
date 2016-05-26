import excite from './excite'

describe('excite', () => {
  it('makes your text more exciting', () => {
    assert(excite('hello') === 'HELLO!!!')
  })
})
