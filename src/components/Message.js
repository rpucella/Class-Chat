import styled from 'styled-components'
import { Avatar } from './avatar'

const MessageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 16px;
  width: 100%;
`

const MessageLayout = styled.div`
  min-height: 36px;
  /* border: 1px solid #dddddd; */
  border-bottom: 1px solid #dddddd;
  /* border-radius: 4px; */
  padding: 8px 8px 24px 8px;
  /* margin: 4px 0px; */
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

const MessageWho = styled.div`
  font-size: 16px;
  font-weight: bold;
`

const MessageWhen = styled.div`
  font-size: 14px;
  color: #aaaaaa;
`

const MessageBody = styled.div`
  font-size: 16px;
  margin-top: 8px;
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


const MessageContent = ({content}) => {
  if (typeof(content) === 'string') {
    return splitUrls(content)
  }
  else if (typeof(content) === 'object' && content[0] === 'pre') {
    const style = { 
      backgroundColor: '#f3f3f3',
      padding: '8px',
      overflowX: 'auto',
      margin: '0px'
    }
    return <pre style={style}>{ content[1] }</pre>
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
        result = <tt>{ result }</tt>
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
	<Avatar avatar={userProfile?.avatar} />
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
	<Avatar avatar={userProfile?.avatar} />
	<MessageSection>
          <MessageHeader who={msg.who} when={msg.when} userProfile={userProfile} />
          <MessageBody>{ msg.what.message.map(s => <MessageContent content={s} />) }</MessageBody>
	</MessageSection>
      </MessageLayout>
    )
  }
}

