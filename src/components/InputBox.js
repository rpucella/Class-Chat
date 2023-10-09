import { useState } from 'react'
import styled from 'styled-components'
import { ApiService } from '../services/api-service'
import { MessageService } from '../services/message-service'

const MESSAGE_SIZE_LIMIT = 1000

const MessageInputBoxLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6rem;
  z-index: 50;

  @media screen and (max-width: 30rem) {
    height: 5rem;
  }
`

const MessageInput = styled.textarea`
  flex: 1 1 auto;
  height: 100%;
  background-color: #eeeeee;
  padding: 0.5rem;
  resize: none;
  box-sizing: border-box;
  font-size: 1rem;

  &:focus { 
    background-color: #cccccc;
  }

  @media screen and (max-width: 30rem) {
    font-size: 0.8rem;
  }
`

const Archived = styled.div`
  flex: 1 1 auto;
  height: 100%;
  background-color: #eeeeee;
  padding-top: 2rem;
  resize: none;
  text-align: center;
  box-sizing: border-box;
  font-size: 1rem;
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

const DEFAULT_MSG = 'Type a message — press ENTER to submit, SHIFT+ENTER for newline\nUse *...* for italics, **...** for bold, `...` for inline code, ```...``` for block code'

export const InputBox = ({profile, site, getNewMessages, refreshLogin}) => {
  const [content, setContent] = useState('')
  const tooLong = content.length > MESSAGE_SIZE_LIMIT
  const submit = async () => {
    if (!tooLong) {
      if (content.trim().length > 0) {
        setContent('')
        const result = await ApiService.postMessageMD(profile.user, site, content)
        if (!result) {
          refreshLogin()
        } else {
          getNewMessages()
        }
      }
    }
  }    
  const handleClick = async (evt) => await submit()
  const isEnter = (evt) => {
    return evt.key === 'Enter' && !evt.shiftKey
  }
  const handleChange = (evt) => {
    if (!isEnter(evt)) {
      ///console.log('got enter in handleChange?')
      setContent(evt.target.value)
    }
  }
  const handleKeyPress = async (evt) => {
    if (isEnter(evt)) {
      ///console.log('got enter in handleKeyPress')
      // SHIFT-ENTER - just keep the CR that gets tacked on automatically
      evt.preventDefault()
      await submit()
    }
  }
  return (
    <MessageInputBoxLayout>
      <MessageInput bad={tooLong}
                    rows={4}
                    value={content}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                    placeholder={DEFAULT_MSG} />
      { /* <Button onClick={handleClick}>Submit</Button> */ }
    </MessageInputBoxLayout>
  )
}

export const InputBoxEditing = ({profile, site, refreshLogin, msg, stopEditing}) => {
  ///console.log(msg)
  const initial = MessageService.unparse(msg.what)
  const id = msg.id
  const [content, setContent] = useState(initial)
  const tooLong = content.length > MESSAGE_SIZE_LIMIT
  const submit = async () => {
    if (!tooLong) {
      // TODO: When trimmed content == '', should be equivalent to deleting
      setContent('')
      const result = await ApiService.updateMessageMD(profile.user, site, content, id)
      if (!result) {
        refreshLogin()
      }
      stopEditing(msg.id, result)
    }
  }
  const handleClick = async (evt) => await submit()
  const isEnter = (evt) => {
    return evt.key === 'Enter' && !evt.shiftKey
  }
  const handleChange = (evt) => {
    if (!isEnter(evt)) {
      ///console.log('got enter in handleChange?')
      setContent(evt.target.value)
    }
  }
  // TODO: Escape to cancel!
  const handleKeyPress = async (evt) => {
    if (isEnter(evt)) {
      ///console.log('got enter in handleKeyPress')
      // SHIFT-ENTER - just keep the CR that gets tacked on automatically
      evt.preventDefault()
      await submit()
    }
  }
  return (
    <MessageInputBoxLayout>
      <MessageInput bad={tooLong}
                    rows={4}
                    value={content}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                    autoFocus={true} />
    </MessageInputBoxLayout>
  )
}


export const ArchivedBox = () => {
  return (
    <MessageInputBoxLayout>
      <Archived>This site has been archived, and is read-only.</Archived>
    </MessageInputBoxLayout>
  )
}
