import styled from 'styled-components'
import version from './version'

const HeaderLayout = styled.div`
  background-color: black;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 64px;
`

const HeaderLogo = styled.div`
  font-variant: small-caps;
  font-size: 32px;
  font-weight: bold;
  padding: 0px 16px;
`
  
const HeaderAccount = styled.div`
  font-size: 24px;
  padding: 0px 32px;
`

const Button = styled.button`
  font-size: 24px;
  padding: 4px 32px;
  background-color: #485fc7;
  color: white;
  border-radius: 4px;
  border: none;
  cursor: pointer;
`

export const Header = ({profile, submitFile}) => {
  const title = profile ? `${profile.site} - v${version}` : `v${version}`
  return (
    <HeaderLayout>
      <HeaderLogo title={title}>WebDevChat</HeaderLogo>
      { profile && submitFile && <Button onClick={submitFile}>Submit file</Button> }
      { profile && <HeaderAccount>{profile.firstName}</HeaderAccount> }
    </HeaderLayout>
  )
}

