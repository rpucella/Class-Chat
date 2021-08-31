import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ApiService } from './services/api-service'
import { Login } from './components/Login'
import { Header } from './components/Header'
import { Screen } from './components/Screen'
import { Router, Redirect } from '@reach/router'

const App = () => {
  // profile = null when not logged in
  // profile = <profile object> otherwise
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    // Try a silent login.
    ApiService.fetchProfile().then((newProfile) => {
      if (newProfile) {
	setProfile(newProfile)
      } else {
	// We can't fetch profile - force a login.
	setProfile(null)
      }
    })
  }, [profile])
  const refreshLogin = () => {
    setProfile(null)
  }
  if (profile) {
    return <Screen profile={profile} site={profile.site} refreshLogin={refreshLogin} />
  }
  return (
      <>
      <Header profile={null} site={null} />
      <Login login={setProfile} />
      </>
  )
}

export default App
