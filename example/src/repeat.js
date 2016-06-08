
const repeat = (f, n) => (x) => {
  if (n > 0) {
    return f(repeat(f, n - 1)(x))
  } else {
    return x
  }
}

export default repeat
