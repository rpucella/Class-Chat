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
  result.push(<span>{arr[0]}</span>)
  for (let idx = 1; idx < arr.length; idx += 2) {
    result.push(<a href={arr[idx]} target="_blank">{arr[idx]}</a>)
    result.push(<span>{arr[idx + 1]}</span>)
  }
  return result
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
}

