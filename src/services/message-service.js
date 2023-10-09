import axios from 'axios'

class MessageServiceImpl {

  // TODO: we may want to keep the original in the DB as well?
  unparse(what) {
    if (what.type === 'text') {
      return what.message?.trim()
    }
    if (what.type === 'md') {
      let result = ''
      for (const content of what.message) {
        if (typeof(content) === 'string') {
          result += content
        }
        else if (typeof(content) === 'object' && content[0] === 'pre') {
          result += '```' + content[1] + '``` '
        }
        else if (typeof(content) === 'object') {
          let partial = content[1]
          for (const c of content[0]) {
            if (c === 'b') {
              partial = '**' + partial + '**'
            }
            else if (c === 'i') {
              partial = '*' + partial + '*'
            }
            else if (c === 't') {
              partial = '`' + partial + '`'
            }
          }
          result += partial + ' '
        }
      }
      return result.trim()
    }
    return ''
  }
}

const MessageService = new MessageServiceImpl()

export { MessageService }
