import { useState } from 'react'
import { signIn } from './api'
import styled from 'styled-components'

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
  width: 100vw;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Label = styled.div`
  font-weight: bold;
  font-size: 16px;
  text-align: right;
  width: 120px;
  line-height: 48px;
  margin: 8px;
  box-sizing: border-box;
`

const Input = styled.input`
  font-size: 16px;
  width: 160px;
  height: 48px;
  margin: 8px;
  padding: 0px 16px;
  border: 1px solid #aaaaaa;
  border-radius: 8px;
  box-sizing: border-box;

  &:focus { 
    outline: none;
    box-shadow: 0 0 4pt 2pt blue;
  }
`

const Button = styled.button`
  width: 160px;
  height: 40px;
  font-size: 14px;
  border: 1px solid #aaaaaa;
  border-radius: 8px;
  margin: 8px;

  &:focus { 
    outline: none;
    box-shadow: 0 0 4pt 2pt blue;
  }
`

const Error = styled.div`
  color: red;
  font-size: 16px;
  height: 40px;
  line-height: 40px;
`

export const Login = ({login}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const handleChangeUsername = (evt) => {
    setUsername(evt.target.value)
    setError(false)
  }
  const handleChangePassword = (evt) => {
    setPassword(evt.target.value)
    setError(false)
  }
  const handleClick = async () => {
    const profile = await signIn(username, password)
    if (profile) {
      profile['user'] = username
      login(profile)
    }
    else {
      setError(true)
    }
  }
  return (
    <Layout>
      <Row>
        <Label>Login</Label>
        <Input type={'text'} value={username} onChange={handleChangeUsername} />
      </Row>
      <Row>
        <Label>Password</Label>
        <Input type={'password'} value={password} onChange={handleChangePassword} />
      </Row>
      <Error> { error ? 'Wrong username or password' : ''} </Error>
      <Button onClick={handleClick}>Sign in</Button>
    </Layout>
  )
}
