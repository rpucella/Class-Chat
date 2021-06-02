import axios from 'axios'

class ApiServiceImpl {

  async postMessage(user, who, where, message) {
    try { 
      const result = await axios.post('/api/post-message',
				      {user: user, who: who, what: {type: 'text', message}, where: where},
				      {withCredentials: true})
      return (result.status === 200)
    } catch(err) {
      if (err.response) {
	// return false only on authentication error
	return (err.response.status !== 401 && err.response.status !== 403)
      }
      return true
    }
  }

  async fetchMessages(since, where) {
    try { 
      const result = await axios.post('/api/get-messages',
				      {since: since, where: where},
				      {withCredentials: true})
      if (result.data.result === 'ok') {
	return result.data.messages
      }
      return []
    } catch(err) {
      if (err.response) {
	return (err.response.status !== 401 && err.response.status !== 403)
      }
      return []
    }
  }
  
  async fetchProfile() {
    try {
      const result = await axios.post('/api/get-profile',
				      {},
				      {withCredentials: true})
      if (result.data.result === 'ok') {
	return result.data.profile
      }
    } catch(err) {
      return false
    }
  }
  
  async signIn(username, password) {
    const result = await axios.post('/api/signin',
				    {username, password},
				    {withCredentials: true})
    if (result.data.result === 'ok') {
      return result.data.profile
    }
    else {
      return null
    }
  }
  
  async signOut() { 
    const result = await axios.post('/api/signout',
				    {},
				    {withCredentials: true})
    if (result.data.result === 'ok') {
      return true
    }
    else {
      return null
    }
  }
  
  async postSubmission(user, selection, file) {
    try {
      const formData = new FormData()
      formData.append('user', user)
      formData.append('selection', selection)
      formData.append('file', file)
      const result = await axios.post('/api/post-submission',
				      formData,
				      {
					withCredentials: true,
					headers: {
					  'Content-Type': 'multipart/form-data'
					}
				      })
      return (result.status === 200)
    } catch(err) {
      console.log(err)
      return false
    }
  }
}

const ApiService = new ApiServiceImpl()

export { ApiService }

