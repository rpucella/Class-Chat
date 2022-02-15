import styled from 'styled-components'
import { Avatar } from './Avatar'

const MessageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`

const MessageLayout = styled.div`
  padding: 0 1rem 2rem;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  @media screen and (max-width: 30rem) {
    padding: 0 0.5rem 2rem;
  }
`

const MessageHeaderLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

const MessageAvatar = styled.div`
  height: 3rem;
  margin-right: 1rem;
  @media screen and (max-width: 30rem) {
    height: 2.5rem;
    margin-right: 0.5rem;
  }
`

const MessageWho = styled.div`
  font-size: 1rem;
  font-weight: bold;
  @media screen and (max-width: 30rem) {
    font-size: 0.8rem;
  }
`

const MessageWhen = styled.div`
  font-size: 0.8rem;
  color: #aaaaaa;
  @media screen and (max-width: 30rem) {
    font-size: 0.6rem;
  }
`

const MessageBody = styled.div`
  font-size: 1rem;
  margin-top: 0.5rem;
  overflow-wrap: anywhere;
  padding: ${props => props.highlight ? '0.5rem' : '0'};
  background-color: ${props => props.highlight ? '#f1e740' : 'white'};
  @media screen and (max-width: 30rem) {
    font-size: 0.8rem;
  }
`

const DateLine = styled.div`
  position: relative;
  top: 1.5rem;
  border-bottom: 1px solid #cccccc;
  width: 100%;
  z-index: -1;
`

const DateSplitter = styled.div`
  border: 1px solid #cccccc;
  border-radius: 12px;
  padding: 0.3rem;
  margin: 0.5rem;
  align-self: center;
  background-color: #f8f8f8;
  font-size: 0.8rem;
  @media screen and (max-width: 30rem) {
    font-size: 0.6rem;
  }
`

export const dateString = (when) => {
  const d = when
  const two = n => n.toString().padStart(2, '0')
  return `${two(d.getMonth() + 1)}/${two(d.getDate())}/${d.getFullYear()}`
}

const timeString = (when) => {
  const d = when
  const two = n => n.toString().padStart(2, '0')
  return `${two(d.getHours())}:${two(d.getMinutes())}`
}

const MessageHeader = ({who, when, userProfile}) => {
  // const dateStr = dateString(when)
  const timeStr = timeString(when)
  const userName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : `(${who})`
  return (
    <MessageHeaderLayout>
      <MessageWho>{ userName }</MessageWho>
      <MessageWhen> { timeStr }</MessageWhen>
    </MessageHeaderLayout>
  )
}

const splitUrls = (s) => {
  // create a list of string separated by urls
  const arr = s.split(/(https?:\/\/[^\s]+)/)
  const result = []
  result.push(arr[0])
  for (let idx = 1; idx < arr.length; idx += 2) {
    result.push(<a href={arr[idx]} target="_blank">{arr[idx]}</a>)
    result.push(arr[idx + 1])
  }
  return result
}

const Code = styled.div`
  /* background-color: #f6f6f6; */
  padding: ${props => props.padding || 0.15}rem;
  word-wrap: break-word;
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Consolas', 'Courier New', monospace;
  display: ${props => props.display || 'inline-block'};
`

const MessageContent = ({content}) => {
  if (typeof(content) === 'string') {
    return splitUrls(content)
  }
  else if (typeof(content) === 'object' && content[0] === 'pre') {
    return <Code display={'block'} padding={0.5}>{ content[1] }</Code>
  }
  else if (typeof(content) === 'object') {
    let result = splitUrls(content[1])
    for (const c of content[0]) {
      if (c === 'b') {
        result = <b>{ result }</b>
      }
      else if (c === 'i') {
        result = <i>{ result }</i>
      }
      else if (c === 't') {
        result = <Code>{ result }</Code>
      }
    }
    return result
  }
}

export const Message = ({msg}) => {
  const firstMsg = msg[0]
  const userProfile = (firstMsg.user && firstMsg.user.length > 0) ? firstMsg.user[0].profile : null
  const newDate = !!firstMsg.newDate
  let body = []
  for (const m of msg) {
    if (m.what.type === 'text') {
      body.push(<MessageBody highlight={m.highlight}>{splitUrls(m.what.message).map(item => item)}</MessageBody>)
    }
    else if (m.what.type === 'md') {
      body.push(<MessageBody highlight={m.highlight}>{ m.what.message.map(s => <MessageContent content={s} />) }</MessageBody>)
    }
  }
  return (
    <>
      { newDate && <><DateLine /> <DateSplitter>{ dateString(firstMsg.whenDate) }</DateSplitter></> }
      <MessageLayout>
        <MessageAvatar><Avatar avatar={userProfile?.avatar} /></MessageAvatar>
	<MessageSection>
          <MessageHeader who={firstMsg.who} when={firstMsg.whenDate} userProfile={userProfile} />
          { body }
	</MessageSection>
      </MessageLayout>
    </>
  )
}

