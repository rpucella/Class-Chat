import styled from 'styled-components'
import { Avatar } from './Avatar'
import editIcon from '../assets/edit-icon.svg'
import trashIcon from '../assets/trash-icon.svg'

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
  padding: 2px 4px;
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

const MessageTextLayout = styled.div`
  font-size: 1rem;
  overflow-wrap: anywhere;
  padding: 4px 4px;
  background-color: ${props => props.highlight ? '#f1e740' : 'inherited'};
  @media screen and (max-width: 30rem) {
    font-size: 0.8rem;
  }
`

const MessageBodyLayout = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;

  &.mine {
    border: 1px solid white;
  }

  .action {
    visibility: hidden;
  }

  &.mine:hover {
    border: 1px solid #eeeeee;
  }

  &.mine:hover .action {
    visibility: visible;
  }
`

const MessageBody = ({highlight, mine, startEditing, msg}) => {
  const className = mine ? 'mine' : ''
  const clickEditing = () => {
    startEditing(msg._id, msg.what)
  }
  ///console.log(msg._id)
  return (
    <MessageBodyLayout className={className}>
      <MessageTextLayout highlight={highlight}>
        { msg.what.type === 'text' &&
          splitUrls(msg.what.message).map(item => item) }
        { msg.what.type === 'md' &&
          msg.what.message.map(s => <MessageContent content={s} />)
        }
      </MessageTextLayout>
      <Actions clickEditing={clickEditing} />
    </MessageBodyLayout>
  )
}


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

const EditIcon = styled.img`
  height: 1rem;
  width: 1rem;
  margin-right: 0.5rem;
  cursor: pointer;

/*
  &:hover {
    background: #eeeeee;
    border-radius: 0.5rem;
  }
*/
`

const TrashIcon = styled.img`
  height: 1rem;
  width: 1rem;
  margin-right: 0.5rem;
  /* cursor: pointer;*/

  /* &:hover {
    background: #eeeeee;

  } */
`

const ActionsLayout = styled.div`
  padding-top: 4px;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Actions = ({clickEditing}) => {
  return (
    <ActionsLayout>
      {/* <TrashIcon className="action" src={trashIcon} /> */}
      <EditIcon className="action" src={editIcon} onClick={clickEditing} />
    </ActionsLayout>
  )
}

const ButtonsDateLayout = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

// TODO: Move the buttons to the actual MessageBody that needs to be edited!
const ButtonsDate = ({when}) => {
  const timeStr = timeString(when)
  return (
    <ButtonsDateLayout>
      <TrashIcon className="action" src={trashIcon} />
      <EditIcon className="action" src={editIcon} />
      <ButtonsDate when={when} />
    </ButtonsDateLayout>
  )
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

const Code = styled.div`
  /* background-color: #f6f6f6; */
  padding: ${props => props.padding || 0.15}rem;
  word-wrap: break-word;
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Consolas', 'Courier New', monospace;
  display: ${props => props.display || 'inline-block'};
`

// TODO: Move these to MessageService with the proper abstraction for the transformation.
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

export const Message = ({msg, me, startEditing}) => {
  const firstMsg = msg[0]
  const userProfile = (firstMsg.user && firstMsg.user.length > 0) ? firstMsg.user[0].profile : null
  const newDate = !!firstMsg.newDate
  return (
    <>
      { newDate && <><DateLine /> <DateSplitter>{ dateString(firstMsg.whenDate) }</DateSplitter></> }
      <MessageLayout>
        <MessageAvatar><Avatar avatar={userProfile?.avatar} /></MessageAvatar>
	<MessageSection>
          <MessageHeader who={firstMsg.who} when={firstMsg.whenDate} userProfile={userProfile} />
          { msg.map(m => <MessageBody mine={me === firstMsg.who}
                                      highlight={m.highlight}
                                      startEditing={startEditing}
                                      msg={m} />) }
	</MessageSection>
      </MessageLayout>
    </>
  )
}

