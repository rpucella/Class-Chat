import { useState } from 'react'
import styled from 'styled-components'
import { ApiService } from '../services/api-service'

const MESSAGE_SIZE_LIMIT = 1000

const MessageInputBoxLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 8px 8px;
`

const MessageInput = styled.textarea`
  flex: 1 1 auto;
  height: 64px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  background-color: #eeeeee;
  padding: 8px;
  resize: none;
  box-sizing: border-box;

  &:focus { 
    outline: none;
    box-shadow: 0 0 4pt 2pt ${props => props.bad ? 'red' : 'blue'};
  }
`

// const Button = styled.button`
//   width: 120px;
//   margin-left: 16px;
//   flex: 0 0 120px;
//   height: 64px;
//   border-radius: 8px;
//   border: 1px solid #aaaaaa;
//   box-sizing: border-box;
//
//   &:focus { 
//     outline: none;
//     box-shadow: 0 0 4pt 2pt blue;
//   }
// `

export const InputBox = ({profile, getNewMessages, refreshLogin}) => {
  console.log(profile)
  const [content, setContent] = useState('')
  const tooLong = content.length > MESSAGE_SIZE_LIMIT
  const submit = async () => {
    if (!tooLong) {
      if (content.trim().length > 0) { 
        (await ApiService.postMessage(profile.user, profile.site, content)) || refreshLogin()
        getNewMessages()
      }
      setContent('')
    }
  }    
  const handleClick = async (evt) => await submit()
  const handleChange = (evt) => {
    setContent(evt.target.value)
  }
  const handleKeyPress = async (evt) => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      // SHIFT-ENTER - just keep the CR that gets tacked on automatically
      await submit()
      evt.preventDefault()
    }
  }
  return (
    <MessageInputBoxLayout>
      <MessageInput bad={tooLong} rows={4} value={content} onKeyDown={handleKeyPress} onChange={handleChange} placeholder={'Type a message - press ENTER to submit, SHIFT+ENTER for newline'} />
      { /* <Button onClick={handleClick}>Submit</Button> */ }
    </MessageInputBoxLayout>
  )
}

