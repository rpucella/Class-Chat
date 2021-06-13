import { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { ApiService } from './services/api-service'
import { Login } from './components/Login'
import { Header } from './components/Header'
import { Messages } from './components/Messages'
import { InputBox } from './components/InputBox'

const getDocHeight = () => {
  const D = document
  return Math.max(
    D.body.scrollHeight, D.documentElement.scrollHeight,
    D.body.offsetHeight, D.documentElement.offsetHeight,
    D.body.clientHeight, D.documentElement.clientHeight
  )
}

const atBottom = () => { 
  return (getDocHeight() - document.scrollingElement.scrollTop < document.scrollingElement.clientHeight + 10)
}

let timerId = null

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

const SubmitFileDialog = ({done, cancel, profile}) => {
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
  if (submitting) {
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
  else {
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
}

const App = () => {
  // profile = null when trying to fetch profile
  // profile = '__signin__' when fetching profile failed
  //   and we need to force a login
  // profile = <profile object> otherwise
  const [profile, setProfile] = useState(null)
  const [site, setSite] = useState(null)
  const [messages, setMessages] = useState([])
  const [lastMessage, setLastMessage] = useState(null)
  const [scrollToBottom, setScrollToBottom] = useState(true)
  const [showSubmitFileDialog, setShowSubmitFileDialog] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const enableSubmitFile = () => {
    setShowSubmitFileDialog(true)
  }
  const cancelSubmitFile = () => {
    setShowSubmitFileDialog(false)
  }
  const getNewMessages = async () => {
    ///console.log('[Getting new messages]')
    const newMessages = await ApiService.fetchMessages(lastMessage, site)
    if (!newMessages) {
      // treat fetchMessages returning false as authentication error
      refreshLogin()
    }
    const bottom = atBottom()
    ///console.log('Are we at the bottom?', bottom)
    if (newMessages.length > 0) {
      setScrollToBottom(bottom)
      setMessages(messages.concat(newMessages))
      setLastMessage(newMessages[newMessages.length - 1].when)
    }
  }
  // should remove timer after done
  useEffect(() => {
    if (profile && site && profile !== '__signin__') {
      // don't start gathering messages until logged in
      getNewMessages()
      timerId = setInterval(getNewMessages, 10000)
    }
    else if (!profile) {
      if (timerId) {
	clearInterval(timerId)
	timerId = null
      }
      // check if we're logged in
      ApiService.fetchProfile().then((newProfile) => {
	if (newProfile) {
	  ///console.log('Profile = ', newProfile)
	  setProfileAndSite(newProfile, newProfile.site)
	} else {
	  /// can't fetch profile - force a signin
	  //console.log('Forcing a sign-in')
	  setProfileAndSite('__signin__', null)
	}
      })
    }
  }, [profile, site])
  useEffect(() => {
    // TODO: I think this is the bit that makes the input box at the bottom flash.
    //       Maybe we need to have a margin-bottom at the way end and have the input box
    //       be fixed position with a z-index above it all?
    ///console.log('scrollToBottom =', scrollToBottom)
    if (scrollToBottom) {
      document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight
    }
  }, [lastMessage])
  const refreshLogin = () => {
    setProfileAndSite(null, null)
  }
  const setProfileAndSite = (profile, site) => {
    setProfile(profile)
    setSite(site)
    // also need to reset messages here
    setMessages([])
    setLastMessage(null)
  }
  if (profile && site && profile !== '__signin__') {
    return (
      <>
	{ showSubmitFileDialog && <SubmitFileDialog cancel={cancelSubmitFile} done={cancelSubmitFile} profile={profile} /> }
        <Header profile={profile} submitFile={enableSubmitFile} refreshLogin={refreshLogin} site={site} />
        <Messages msgs={messages} />
        <InputBox profile={profile} getNewMessages={getNewMessages} refreshLogin={refreshLogin} />
      </>
    )
  }
  else if (profile && profile === '__signin__') {
    return (
      <>
        <Header profile={null} site={null} />
        <Login login={setProfileAndSite} />
      </>
    )
  }
  else {
    return <Header profile={null} site={null} />
  }
}

export default App
