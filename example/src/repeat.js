
const repeat = (f, n) => (x) => n > 0 ? f(repeat(f, n - 1)(x)) : x
export default repeat
