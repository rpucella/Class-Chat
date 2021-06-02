import styled from 'styled-components'

const MessageLayout = styled.div`
  min-height: 36px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 8px;
  margin: 8px 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: ${props => props.highlight ? '#FEDD00' : 'transparent'};
`

const MessageHeaderLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

const MessageWho = styled.div`
  font-size: 14px;
  font-weight: bold;
`

const MessageWhen = styled.div`
  font-size: 12px;
  color: #aaaaaa;
`

const MessageBody = styled.div`
  font-size: 14px;
  margin-top: 8px;
`

const MessageHeader = ({who, when}) => {
  const whenStr = new Date(when).toLocaleString()
  return (
    <MessageHeaderLayout>
      <MessageWho>{ who }</MessageWho>
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
  if (msg.what.type === 'text') {
    return (
      <MessageLayout highlight={msg.highlight}>
        <MessageHeader who={msg.who} when={msg.when} />
        <MessageBody>{splitUrls(msg.what.message).map(item => item)}</MessageBody>
      </MessageLayout>
    )
  }
}

