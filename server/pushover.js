
const axios = require('axios')

const form_urlencoded = (obj) => {
  return Object.keys(obj)
    .map((key) => `${key}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

const notifyPushover = async (siteObj, message) => {
  const original = {
    token: process.env.PUSHOVER_API_TOKEN,
    user: process.env.PUSHOVER_USER_KEY,
    title: `ClassChat - ${siteObj.name}`,
    message: message.slice(0, 1000)
  }
  const data = form_urlencoded(original)
  const response = await axios.post('https://api.pushover.net/1/messages.json',
                                    data,
                                    {
                                      headers: {
                                        'content-type': 'application/x-www-form-urlencoded'
                                      }
                                    })

  console.log(response.status)
}

exports.notifyPushover = notifyPushover
