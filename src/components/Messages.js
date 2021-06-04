import styled from 'styled-components'
import { Message } from './Message'

const MessagesLayout = styled.div`
  margin: 72px 8px 8px 8px;
`

export const Messages = ({msgs}) => (
  <MessagesLayout>
    { msgs.map(msg => <Message key={`msg${msg.id}`} msg={msg} />) }
  </MessagesLayout>
)

