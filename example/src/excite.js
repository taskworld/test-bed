import add from './add'
import compose from './compose'
import repeat from './repeat'

const addExclamation = (text) => add(text, '!')
const convertToUppercase = (text) => text.toUpperCase()
export default compose(repeat(addExclamation, 3), convertToUppercase)
