import repeat from './repeat'

describe('repeat', () => {
  it('apply function repeatedly', () => {
    assert(repeat(x => x + 1, 10)(20) === 30)
  })
})
