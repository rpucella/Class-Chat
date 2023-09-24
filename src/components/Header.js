import { useState } from 'react'
import styled, { css } from 'styled-components'
import { ApiService } from '../services/api-service'
import version from '../version'
import { Avatar } from './Avatar'
import { navigate } from '@reach/router'
import feedIcon from '../assets/feed-icon.svg'

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
  height: 4rem;
  /* This needs to be larger than the z-index of the messages
     to ensure that the stacking contexts work. */
  z-index: 100;
`

const HeaderLogo = styled.div`
  font-variant: small-caps;
  font-size: 2rem;
  font-weight: bold;
  padding: 0 1rem;
  @media screen and (max-width: 40rem) {
    display: none;
  }
`
  
const HeaderSite = styled.div`
  font-variant: small-caps;
  font-size: 2rem;
  padding: 0 1rem;
  @media screen and (max-width: 40rem) {
    font-size: 1.5rem;
  }
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

const MenuAvatar = styled.div`
  padding: 0 1rem;
  cursor: pointer;
  height: 2.5rem;
  opacity: ${props => props.disabled ? '0.5' : '1'};
`

const FeedIcon = styled.img`
  height: 1.5rem;
  width: 1.5rem;
  @media screen and (max-width: 40rem) {
    height: 1rem;
    width: 1rem;
  }
`

const FeedLayout = styled.div`
  display: inline-block;
  padding: 0 1rem;
  height: 1.5rem;
  width: 1.5rem;
  @media screen and (max-width: 40rem) {
    height: 1rem;
    width: 1rem;
  }
`

const Feed = ({id}) => {
  return (
      <FeedLayout>
        <a href={`https://storage.googleapis.com/classchat-feeds/${id}.xml?ignoreCache=1`}>
          <FeedIcon src={feedIcon} />
        </a>
      </FeedLayout>
  )
}


const UserMenu = ({disabled, profile, version, refreshLogin, submitFile, seeFeedback, seeSubmissions, site}) => {
  const [visible, setVisible] = useState(false)
  const sites = profile.sitesObj
  const siteKeys = Object.keys(sites)
  const showSubMenus = submitFile || seeFeedback || seeSubmissions
  const clickSignOut = async () => {
    await ApiService.signOut()
    refreshLogin()
  }
  const clickSubmitFile = () => {
    setVisible(false)
    submitFile()
  }
  const clickFeedbacks = () => {
    setVisible(false)
    seeFeedback()
  }
  const clickSubmissions = () => {
    setVisible(false)
    seeSubmissions()
  }
  const clickGoTo = (site) => () => {
    setVisible(false)
    navigate(`/${site}`)
  }
  const showMenu = () => {
    if (disabled) {
      return
    }
    setVisible(!visible)
  }
  return (
    <div>
      <MenuAvatar disabled={disabled} onClick={showMenu}><Avatar avatar={profile.avatar} /></MenuAvatar>
      <MenuBackground visible={visible} onClick={() => setVisible(false)} />
      <MenuContent px={-16} py={48} visible={visible}>
	<UserMenuLayout>
	  <List>
  	  <Version>v{version}</Version>
	    <Entry>{profile.firstName} {profile.lastName}</Entry>
	    <Entry>{profile.email}</Entry>
	  </List>
	  <Line />
	  { showSubMenus &&
            <>
              <List>
	        { submitFile && <LinkEntry onClick={clickSubmitFile}>Submit file</LinkEntry> }
	        { seeSubmissions && <LinkEntry onClick={clickSubmissions}>See submissions</LinkEntry> }
	        { seeFeedback && <LinkEntry onClick={clickFeedbacks}>See feedback</LinkEntry> }
	      </List>
	      <Line />
            </>
          }
          { siteKeys.length > 1 &&
            <>
              <List>
                { siteKeys.map(site => <LinkEntry onClick={clickGoTo(site)}>{ sites[site].name || site }</LinkEntry>) }
              </List>
              <Line />
            </>
          }
	  <List>
	    <LinkEntry onClick={clickSignOut}>Sign out</LinkEntry>
	  </List>
	</UserMenuLayout>
      </MenuContent>
    </div>
  )
}

export const Header = ({disabled, profile, submitFile, seeFeedback, seeSubmissions, refreshLogin, site}) => {
  const sites = profile?.sitesObj
  return (
    <HeaderLayout>
      <HeaderLogo>ClassChat</HeaderLogo>
      <HeaderSite>
        {site ? sites[site].name || site : ' '}
        {site && sites[site].feed && <Feed src={feedIcon} id={sites[site].feed} />}
      </HeaderSite>
      { profile && <UserMenu disabled={disabled} profile={profile} refreshLogin={refreshLogin} version={version} submitFile={site && submitFile} seeFeedback={site && seeFeedback} seeSubmissions={site && seeSubmissions} site={site}/> }
    </HeaderLayout>
  )
}

