import { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { ApiService } from '../services/api-service'
import { Messages } from './Messages'
import { InputBox } from './InputBox'
import { Header } from './Header'
import { Selection } from './Selection'

const POLL_INTERVAL = 60

const SubmitFileDialogLayout = styled.div`
  position: fixed;
  left: calc(50vw - 300px);
  width: 600px;
  top: calc(50vh - 120px);
  height: 240px;
  border: 2px solid #333333;
  border-radius: 8px;
  background: white;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px;
  justify-content: space-between;

  & > * { 
    margin: 8px 0;
  }
`

const Button = styled.div`
  font-size: 16px;
  padding: 8px 24px;
  border-radius: 4px;
  border: 1px solid #aaaaaa;
  cursor: pointer;
  margin-right: 32px;
`

const ButtonOK = styled(Button)`
  background-color: #485fc7;
  color: white;
  border: none;
`

const Select = styled.select`
  font-size: 16px;
  height: 32px;
`

const Input = styled.input`
  font-size: 16px;
  padding: 4px 16px;
  height: 32px;
`

const ButtonRow = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex: 0 0 auto;
  align-content: center;
`

const ModalBackground = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);  
  z-index: 50;
`;

const Error = styled.div`
  font-size: 16px;
  color: red;
  font-style: italic;
`

const SubmitFileDialog = ({show, done, cancel, profile}) => {
  const [selection, setSelection] = useState('homework1')
  const inputRef = useRef(null)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const handleSelectionChange = (evt) => {
    setSelection(evt.target.value)
  }
  const handleSubmit = async () => {
    const files = inputRef.current.files
    // restrict to 1MB?
    if (files.length > 0) {
      if (files[0].size < 1024000) {
	// inputRef gets reset to empty when it unmounts, so save it
	setSubmitting({name: files[0].name, size: files[0].size, type: files[0].type})
	console.log('selection =', selection)
	console.log('file =', files[0])
	const result = await ApiService.postSubmission(profile.user, selection, files[0])
	setSubmitting(false)
	if (result) {
	  done()
	}
	else {
	  setError('ERROR: submission exception')
	}
      }
      else {
	setSubmitting(false)
	setError('ERROR: file larger than 1MB')
      }
    }
  }
  if (show && submitting) {
    return (
      <>
	<ModalBackground />  
	<SubmitFileDialogLayout>
            <div>Submitting file...</div>
	    <div><b>User:</b> {profile.user}</div>
	    <div><b>Selection:</b> {selection}</div>
	    <div><b>File:</b> {submitting.name}</div>
            <div><b>Size:</b> {submitting.size}</div>
	    <div><b>Type:</b> {submitting.type}</div>
	</SubmitFileDialogLayout>
      </>
    )  
  }
  else if (show) {
    return (
    <>
      <ModalBackground />  
      <SubmitFileDialogLayout>
        <label for="input-type">Submission:</label>
        <Select id="input-type" onChange={handleSelectionChange} value={selection}>
          <option value="homework1">Homework 1</option>
          <option value="homework2">Homework 2</option>
          <option value="homework3">Homework 3</option>
          <option value="homework4">Homework 4</option>
          <option value="project">Final project</option>
        </Select>
        <label for="input-file">File to submit:</label>
        <Input id="input-file" type="file" ref={inputRef}/>
        <ButtonRow>
          <ButtonOK onClick={handleSubmit}>Submit</ButtonOK>
          <Button onClick={cancel}>Cancel</Button>
          { error && <Error>{error}</Error> }
        </ButtonRow>
      </SubmitFileDialogLayout>
    </>
    )
  }
  else {
    return null
  }
}

export const Screen = ({profile, site, refreshLogin}) => {
  const [messages, setMessages] = useState([])
  const [lastMessage, setLastMessage] = useState(null)
  const [showSubmitFileDialog, setShowSubmitFileDialog] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const sites = profile.sites || [profile.site]
  const enableSubmitFile = () => {
    setShowSubmitFileDialog(true)
  }
  const cancelSubmitFile = () => {
    setShowSubmitFileDialog(false)
  }
  const getNewMessages = async (ignoreLastMessage) => {
    const lm = ignoreLastMessage ? null : lastMessage
    const newMessages = await ApiService.fetchMessages(lm, site)
    if (!newMessages) {
      // Treat fetchMessages returning false as authentication error.
      refreshLogin()
    }
    if (newMessages.length > 0) {
      setMessages(messages.concat(newMessages))
      setLastMessage(newMessages[newMessages.length - 1].when)
    }
  }
  useEffect(() => {
    setLastMessage(null)    // Not sure if necessary.
    getNewMessages(true)    // Ignore lastMessage.
    const timerId = setInterval(getNewMessages, POLL_INTERVAL * 1000)
    return () => { 
      clearInterval(timerId)
    }
  }, [site])   // Reload messages when switching site.
  if (!sites.includes(site)) {
    return <Selection profile={profile} notFound={site} refreshLogin={refreshLogin} />
  }
  return (
    <>
      <SubmitFileDialog show={showSubmitFileDialog} cancel={cancelSubmitFile} done={cancelSubmitFile} profile={profile} />
      <Header profile={profile} submitFile={enableSubmitFile} refreshLogin={refreshLogin} site={site} />
      <Messages msgs={messages} />
      <InputBox profile={profile} site={site} getNewMessages={getNewMessages} refreshLogin={refreshLogin} />
    </>
  )
}
