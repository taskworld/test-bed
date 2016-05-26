import compose from './compose'

describe('compose', () => {
  it('composes two functions', () => {
    const f = a => a + 1
    const g = a => a * 2
    assert(compose(f, g)(100) === 201)
  })
})
