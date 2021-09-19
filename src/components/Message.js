import styled from 'styled-components'
import { Avatar } from './avatar'

const MessageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`

const MessageLayout = styled.div`
  min-height: 2.25rem;
  border-bottom: 1px solid #eeeeee;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  background-color: ${props => props.highlight ? '#F1E5AC' : 'transparent'};
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
  @media screen and (max-width: 30rem) {
    font-size: 0.8rem;
  }
`

const dateString = (when) => {
  const d = new Date(when)
  const two = n => n.toString().padStart(2, '0')
  return `${two(d.getDate())}/${two(d.getMonth() + 1)}/${d.getFullYear()} ${two(d.getHours())}:${two(d.getMinutes())}`
}

const MessageHeader = ({who, when, userProfile}) => {
  const whenStr = dateString(when)
  const userName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : `(${who})`
  return (
    <MessageHeaderLayout>
      <MessageWho>{ userName }</MessageWho>
      <MessageWhen>{ whenStr }</MessageWhen>
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
  background-color: #f6f6f6;
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
  const userProfile = (msg.user && msg.user.length > 0) ? msg.user[0].profile : null
  if (msg.what.type === 'text') {
    return (
      <MessageLayout highlight={msg.highlight}>
        <MessageAvatar><Avatar avatar={userProfile?.avatar} /></MessageAvatar>
	<MessageSection>
          <MessageHeader who={msg.who} when={msg.when} userProfile={userProfile} />
          <MessageBody>{splitUrls(msg.what.message).map(item => item)}</MessageBody>
	</MessageSection>
      </MessageLayout>
    )
  }
  else if (msg.what.type === 'md') {
    return (
      <MessageLayout highlight={msg.highlight}>
        <MessageAvatar><Avatar avatar={userProfile?.avatar} /></MessageAvatar>
	<MessageSection>
          <MessageHeader who={msg.who} when={msg.when} userProfile={userProfile} />
          <MessageBody>{ msg.what.message.map(s => <MessageContent content={s} />) }</MessageBody>
	</MessageSection>
      </MessageLayout>
    )
  }
}

