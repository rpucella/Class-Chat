const bcrypt = require('bcrypt')
const fs = require('fs')
const https = require('https')
const { MongoClient } = require('mongodb')
require('dotenv').config()

const uri = process.env.MONGODB   // 'mongodb://natalia.local?retryWrites=true&writeConcern=majority'
const client = new MongoClient(uri, {useUnifiedTopology: true})

// Format of users file:
// email, last name, first name


async function run(site, usersFile) {
  try {
    const data = fs.readFileSync(usersFile, 'utf8')
    const lines = data.split(/\n+/)
    await client.connect()
    const db = client.db('classChat')
    for (const line of lines) {
      if (line.trim()) { 
        const [email, last, first] = line.split(',').map(s => s.trim())
        const pwd = await getPassword()
        console.log('------------------------------------------------------------')
        console.log('EM =', email)
        console.log('FN =', first)
        console.log('LN =', last)
        console.log('PW =', pwd)
        await createUser(db, email, pwd, first, last, email, site)
      }
    }
    await client.close()
  } catch (err) {
    console.error(err)
  }
}

async function getPassword() { 
  const options = {
    hostname: 'www.passwordrandom.com',
    port: 443,
    path: '/query?command=password',
    method: 'GET'
  }
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      //      console.log(`statusCode: ${res.statusCode}`)
      res.on('data', d => {
        resolve(d.toString())
      })
    })
    req.on('error', error => {
      reject(error)
    })
    req.end()
  })
}


async function createUser(db, user, password, firstName, lastName, email, site) {
  const hash = await bcrypt.hash(password, 10)
  await db.collection('users').insertOne({user, password: hash, profile: { user, firstName, lastName, email, avatar: {type: 'default', color: [0, 128, 0], initials: firstName[0] + lastName[0]}, sites: [site]}, lastLogin: null})
  console.log(`User ${user} created`)
}

process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})

if (process.argv.length > 3) { 
  run(process.argv[2], process.argv[3])
}
else {
  console.log('Usage: create-users <site> <users.csv>')
}

