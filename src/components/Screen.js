import { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { ApiService } from '../services/api-service'
import { Messages } from './Messages'
import { InputBox, ArchivedBox } from './InputBox'
import { Header } from './Header'
import { Selection } from './Selection'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const POLL_INTERVAL = 60

const SubmitFileDialogLayout = styled.div`
  position: fixed;
  left: calc(50vw - 300px);
  width: 600px;
  top: calc(50vh - 150px);
  height: 300px;
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

const FeedbacksDialogLayout = styled.div`
  position: fixed;
  left: calc(50vw - 300px);
  width: 600px;
  top: calc(50vh - 200px);
  height: 400px;
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

const SubmissionsDialogLayout = styled.div`
  position: fixed;
  left: calc(50vw - 300px);
  width: 600px;
  top: calc(50vh - 200px);
  height: 400px;
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
  margin-top: auto;
/*  margin-top: 32px;*/
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

const Feedback = styled.pre`
  // margin-left: 24px;
  color: ${props => props.isLink ? 'blue' : '#333333'};
  font-family: monospace;
  font-size: 120%;
  cursor: ${props => props.isLink ? 'pointer' : 'initial'};
`

const SubmitFileDialog = ({show, done, cancel, profile, submissions}) => {
  const [selection, setSelection] = useState(submissions[0].submission)
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
	//console.log('selection =', selection)
	//console.log('file =', files[0])
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
          { submissions.map(sub => <option value={sub.submission}>{ sub.name }</option>) }
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

function openAsPageInNewTab(fbName, pageContent) {
  // Create blob link to download
  let mime = 'application/octet-stream'
  if (fbName.endsWith('.txt')) {
    mime = 'text/plain'
  }
  const blob = new Blob([pageContent], {type: mime})
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement(`a`)
  a.href = url
  a.setAttribute('download', fbName)
  a.style.display = `none`
  document.body.appendChild(a) // We need to do this,
  a.click()                    // so that we can do this,
  document.body.removeChild(a) // after which we do this.
}

const FeedbacksDialog = ({show, done, profile, site}) => {
  const [feedbacks, setFeedbacks] = useState([])
  useEffect(async () => {
    if (show) { 
      const fbs = await ApiService.fetchFeedbacks(profile.user, site)
      fbs.sort()
      setFeedbacks(fbs)
    }
  }, [site, show])
  const showFeedback = async (fb) => {
    const content = await ApiService.fetchFeedback(profile.user, site, fb)
    openAsPageInNewTab(fb, content)
  }
  if (show) {
    return (
      <>
        <ModalBackground />  
        <FeedbacksDialogLayout>
          <b>Available feedback:</b>
          { feedbacks.map(fb => <Feedback isLink={true} onClick={() => showFeedback(fb)}>{fb}</Feedback>) }
          <ButtonRow>
            <ButtonOK onClick={done}>OK</ButtonOK>
          </ButtonRow>
        </FeedbacksDialogLayout>
      </>
    )
  }
  else {
    return null
  }
}

const SubmissionEntry = ({name, time, file, size}) => {
  const ptime = dayjs(time, 'YYYY-MM-DD-HH-mm-ss').format('MM/DD/YYYY HH:mm')
  return <Feedback>{name}: {file}   {ptime}   ({size} B)</Feedback>
}

const SubmissionsDialog = ({show, done, profile, site}) => {
  const [submissions, setSubmissions] = useState([])
  useEffect(async () => {
    if (show) { 
      const sbs = await ApiService.fetchSubmissions(profile.user, site)
      sbs.sort((a, b) => {
        if (a.name < b.name) {
          return -1
        } else if (a.name > b.name) {
          return 1
        } else if (a.file < b.file) {
          return -1
        } else if (a.file > b.file) {
          return 1
        } else if (a.time > b.time) {
          return -1
        } else if (a.time < b.time) {
          return 1
        } else {
          return 0
        }
      })   // Probably need something better here, since sbs are objects...
      console.log(sbs)
      setSubmissions(sbs)
    }
  }, [site, show])
  if (show) {
    const maxNameWidth = submissions.reduce((r, sb) => Math.max(r, sb.name.length), 0)
    const maxFileWidth = submissions.reduce((r, sb) => Math.max(r, sb.file.length), 0)
    console.log(maxNameWidth, maxFileWidth)
    const pad = (s, w) => (s + new Array(w + 1).join(' ')).slice(0, w)
    return (
      <>
        <ModalBackground />  
        <SubmissionsDialogLayout>
          <b>Existing submissions:</b>
          { submissions.map(sb => <SubmissionEntry name={pad(sb.name, maxNameWidth)}
                                                   time={sb.time}
                                                   file={pad(sb.file, maxFileWidth)}
                                                   size={sb.size}/>) }
          <ButtonRow>
            <ButtonOK onClick={done}>OK</ButtonOK>
          </ButtonRow>
        </SubmissionsDialogLayout>
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
  const [showFeedbacksDialog, setShowFeedbacksDialog] = useState(false)
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const sites = profile.sitesObj
  const submissions = site ? sites[site].submissions || [] : []
  const hasSubmissions = submissions.length > 0
  const isArchived = !!sites[site].archived
  const enableSubmitFile = () => {
    setShowSubmitFileDialog(true)
  }
  const cancelSubmitFile = () => {
    setShowSubmitFileDialog(false)
  }
  const enableFeedbacks = () => {
    setShowFeedbacksDialog(true)
  }
  const cancelFeedbacks = () => {
    setShowFeedbacksDialog(false)
  }
  const enableSubmissions = () => {
    setShowSubmissionsDialog(true)
  }
  const cancelSubmissions = () => {
    setShowSubmissionsDialog(false)
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
    setLastMessage(null)     // Not sure if necessary.
    getNewMessages(true)    // Ignore lastMessage.
    if (!isArchived) {
      const timerId = setInterval(getNewMessages, POLL_INTERVAL * 1000)
      return () => { 
        clearInterval(timerId)
      }
    }
  }, [site])   // Reload messages when switching site.
  if (!Object.keys(sites).includes(site)) {
    return <Selection profile={profile} notFound={site} refreshLogin={refreshLogin} />
  }
  return (
    <>
      { hasSubmissions && <SubmitFileDialog show={showSubmitFileDialog} cancel={cancelSubmitFile} done={cancelSubmitFile} profile={profile} submissions={submissions} /> }
      { hasSubmissions && <FeedbacksDialog show={showFeedbacksDialog} done={cancelFeedbacks} profile={profile} site={site} /> }
      { hasSubmissions && <SubmissionsDialog show={showSubmissionsDialog} done={cancelSubmissions} profile={profile} site={site} /> }
      <Header disabled={showSubmitFileDialog || showFeedbacksDialog} profile={profile} submitFile={!isArchived && hasSubmissions && enableSubmitFile} seeSubmissions={hasSubmissions && enableSubmissions} seeFeedback={hasSubmissions && enableFeedbacks} refreshLogin={refreshLogin} site={site} />
      <Messages msgs={messages} />
      { isArchived ? <ArchivedBox /> : <InputBox profile={profile} site={site} getNewMessages={getNewMessages} refreshLogin={refreshLogin} /> }
    </>
  )
}
