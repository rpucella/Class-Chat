import axios from 'axios'

class ApiServiceImpl {

  async postMessage(who, where, message) {
    // Post a normal text message
    try { 
      const result = await axios.post('/api/post-message',
				      {who: who, what: {type: 'text', message}, where: where},
				      {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
      return (result.status === 200)
    } catch(err) {
      if (err.response) {
	// return false only on authentication error
	return (err.response.status !== 401 && err.response.status !== 403)
      }
      return true
    }
  }

  async postMessageMD(who, where, message) {
    // Post a markdown message
    try {
      const result = await axios.post('/api/post-message',
				      {who: who, what: {type: 'md', message}, where: where},
				      {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
      return (result.status === 200)
    } catch(err) {
      if (err.response) {
	// return false only on authentication error
	return (err.response.status !== 401 && err.response.status !== 403)
      }
      return true
    }
  }

  async updateMessageMD(who, where, message, id) {
    // Update a markdown message.
    // NOT ALL ARGUMENTS ARE USED.
    try {
      const result = await axios.post('/api/update-message',
				      {who: who, what: {type: 'md', message}, where: where, id: id},
				      {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
      if (result.data.result === 'ok') {
        return result.data.what
      }
      return {'type': 'text', 'message': ''}
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
				      {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
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
  
  async fetchFeedbacks(who, where) {
    try { 
      const result = await axios.post('/api/get-feedbacks',
				      {user: who, where: where},
				      {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
      if (result.data.result === 'ok') {
	return result.data.feedbacks
      }
      return []
    } catch(err) {
      if (err.response) {
	return (err.response.status !== 401 && err.response.status !== 403)
      }
      return []
    }
  }
  
  async fetchSubmissions(who, where) {
    try {
      console.log('About to fetch submissions')
      const result = await axios.post('/api/get-submissions',
				      {user: who, where: where},
				      {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
      if (result.data.result === 'ok') {
	return result.data.submissions
      }
      return []
    } catch(err) {
      if (err.response) {
	return (err.response.status !== 401 && err.response.status !== 403)
      }
      return []
    }
  }
  
  async fetchFeedback(who, where, feedback) {
    try { 
      const result = await axios.post('/api/get-feedback',
				      {user: who, where: where, feedback: feedback},
				      {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
      if (result.data.result === 'ok') {
	return result.data.feedback
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
				      {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
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
				    {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
    if (result.data.result === 'ok') {
      localStorage.setItem('token', result.data.token)
      return result.data.profile
    }
    else {
      return null
    }
  }
  
  async signOut() { 
    const result = await axios.post('/api/signout',
				    {},
				    {
                                        withCredentials: true,
                                        headers: {
                                          "X-token": localStorage.getItem('token')
                                        }
                                      })
    if (result.data.result === 'ok') {
      localStorage.removeItem('token')
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
					  'Content-Type': 'multipart/form-data',
                                          "X-token": localStorage.getItem('token')
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

