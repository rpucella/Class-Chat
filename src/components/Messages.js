import styled from 'styled-components'
import { Message } from './Message'

const MessagesLayout = styled.div`
  /* margin: 72px 8px 8px 8px; */
  margin: 64px 0px 0px 0px;
`

export const Messages = ({msgs}) => (
  <MessagesLayout>
    { msgs.map(msg => <Message key={`msg${msg.id}`} msg={msg} />) }
  </MessagesLayout>
)

