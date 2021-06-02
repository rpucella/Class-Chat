import { useState } from 'react'
import styled, { css } from 'styled-components'
import { ApiService } from '../services/api-service'
import version from '../version'
import userSvg from '../assets/user-icon.svg'

const HeaderLayout = styled.div`
  background-color: black;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
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
  
const HeaderSite = styled.div`
  font-variant: small-caps;
  font-size: 32px;
  padding: 0px 16px;
`

const MenuContent = styled.div`
  position: absolute;
  z-index: 1000;
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  ${props => props.px < 0 ? css`right: ${props => -props.px}px;` : css`left: ${props => props.px}px`}
  ${props => props.py < 0 ? css`bottom: ${props => -props.py}px;` : css`top: ${props => props.py}px`}
`

const MenuBackground = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 900;
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
`

const UserMenuLayout = styled.div`
  border: 2px solid #666;
  color: #333;
  background: white;
  border-radius: 4px;
  background-clip: padding-box;
  padding: 4px 4px;
`

const Line = styled.hr`
  color: #666;
`

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const Entry = styled.li`
  padding: 4px 4px;
  margin: 0;
`

const Version = styled(Entry)`
  text-align: right;
  font-size: 70%;
  font-style: italic;
  color: #888;
  padding: 2px 4px;
`

const LinkEntry = styled(Entry)`
  color: #003d99;
  font-weight: bold;
  cursor: pointer;
`

const Icon = styled.img`
  display: inline-block;
  padding: 0 16px;
  cursor: pointer;
`

const UserMenu = ({profile, version, refreshLogin, submitFile}) => {
  const [visible, setVisible] = useState(false)
  const clickSignOut = async () => {
    await ApiService.signOut()
    refreshLogin()
  }
  const clickSubmitFile = () => {
    setVisible(false)
    submitFile()
  }
  return (
    <div>
      <Icon src={userSvg} onClick={() => setVisible(!visible)} />
      <MenuBackground visible={visible} onClick={() => setVisible(false)} />
      <MenuContent px={-16} py={48} visible={visible}>
	<UserMenuLayout>
	  <List>
	    <Version>v{version}</Version>
	    <Entry>{profile.firstName} {profile.lastName}</Entry>
	    <Entry>{profile.email}</Entry>
	  </List>
	  { /*
	  <Line />
	  <List>
	    <Entry>{profile.site}</Entry>
	    </List> */ }
	  <Line />
	  <List>
	    <LinkEntry onClick={clickSubmitFile}>Submit file</LinkEntry>
	  </List>
	  <Line />
	  <List>
	    { /* <LinkEntry onClick={() => toggleAdminMode()}>Admin mode</LinkEntry> */ }
	    <LinkEntry onClick={clickSignOut}>Sign out</LinkEntry>
	  </List>
	</UserMenuLayout>
      </MenuContent>
    </div>
  )
}

export const Header = ({profile, submitFile, refreshLogin}) => {
  const title = profile ? `${profile.site} - v${version}` : `v${version}`
  return (
    <HeaderLayout>
      <HeaderLogo>ClassChat</HeaderLogo>
      { profile && <HeaderSite>{profile.site}</HeaderSite> }
      { profile && <UserMenu profile={profile} refreshLogin={refreshLogin} version={version} submitFile={submitFile} /> }
    </HeaderLayout>
  )
}

