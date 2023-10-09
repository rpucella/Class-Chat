import { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Message, dateString } from './Message'

// Time (in ms) to consider two messages part of the same larger message
const FOLD_DIFF = 5 * 60 * 1000

const MessagesLayout = styled.div`
  position: fixed;
  top: 4rem;
  left: 0;
  right: 0;
  height: calc(100% - 4rem - 6rem);
  overflow-y: auto;
  z-index: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  @media screen and (max-width: 30rem) {
    height: calc(100% - 4rem - 5rem);
  }
`

export const Messages = ({msgs, me, startEditing}) => {
  const [scrollToBottom, setScrollToBottom] = useState(true)
  const ref = useRef(null)
  const prevScrollHeight = useRef(0)
  useEffect(() => {
    //console.log('prevScrollHeight.current', prevScrollHeight.current)
    //console.log('ref.current.scrollTop', ref.current.scrollTop)
    //console.log('ref.current.clientHeight', ref.current.clientHeight)
    if (prevScrollHeight.current - ref.current.scrollTop < ref.current.clientHeight + 10) {
      // We were at the bottom of the screen based on the previous messages received.
      // So scroll all the way down to track the new messages.
      ref.current.scrollTop = ref.current.scrollHeight
      prevScrollHeight.current = ref.current.scrollHeight
    }
  }, [msgs])
  let currDay = null
  let prevMsg = {
    who: null,
    dateStr: null,
    date: 0
  }
  const msgsGrouped= []
  let group = []
  for (const msg of msgs) {
    const d = new Date(msg.when)
    const dateStr = dateString(d)
    if (currDay !== dateStr) {
      msg.newDate = true
      currDay = dateStr
    }
    msg.whenDate = d
    if (prevMsg.who === msg.who && prevMsg.dateStr === dateStr && (d - prevMsg.date) < FOLD_DIFF) {
      // If message is from same user, on the same date, within N minutes of previous msg,
      // fold into current messages.
      group.push(msg)
    }
    else {
      if (group.length > 0) { 
        msgsGrouped.push(group)
      }
      group = [msg]
      prevMsg.who = msg.who
      prevMsg.dateStr = dateStr
    }
    // Always make the previous date be from the last actual message.
    prevMsg.date = d
  }
  if (group.length > 0) {
    msgsGrouped.push(group)
  }
  return (
    <MessagesLayout ref={ref} >
      { msgsGrouped.map(msg => <Message key={`msg${msg[0].id}`}
                                        msg={msg}
                                        me={me}
                                        startEditing={startEditing}/>) }
    </MessagesLayout>
  )
}
