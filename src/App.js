import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ApiService } from './services/api-service'
import { Login } from './components/Login'
import { Header } from './components/Header'
import { Screen } from './components/Screen'
import { Router, navigate } from '@reach/router'
import { Selection } from './components/Selection'

const App = () => {
  // profile = null when figuring out what to do
  // profile = __login__ when not logged in 
  // profile = <profile object> otherwise
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    // Try a silent login.
    if (!profile) {
      ApiService.fetchProfile().then((newProfile) => {
        if (newProfile) {
	  setProfile(newProfile)
        } else {
	  // We can't fetch profile - force a login.
	  setProfile('__login__')
        }
      })
    }
  }, [profile])
  const refreshLogin = () => {
    setProfile(null)
    navigate('/')
  }
  if (!profile) {
    return <Header profile={null} site={null} />
  }
  else if (profile === '__login__') {
    return (
      <>
        <Header profile={null} site={null} />
        <Login login={setProfile} />
      </>
    )
  }
  return (
    <Router>
      <Selection path="/" profile={profile} refreshLogin={refreshLogin} />
      <Screen path="/:site" profile={profile} refreshLogin={refreshLogin} />
    </Router>
  )
}

export default App
