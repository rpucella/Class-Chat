const bcrypt = require('bcrypt')
const fs = require('fs')
const https = require('https')
const { MongoClient } = require('mongodb')
const { nanoid } = require('nanoid')
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
        const pwd = getPassword()
        // Not sure if this is enough to handle the "repeated passwords" problem.
        await sleep(5000)
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

function getPassword_OLD() {
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

function getPassword() {
  return nanoid()
}


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function createUser(db, user, password, firstName, lastName, email, site) {
  const hash = await bcrypt.hash(password, 10)
  const userRecord = await db.collection('users').findOne({user: user})
  if (userRecord) {
    const sites = userRecord.profile.sites
    if (!sites.includes(site)) {
      sites.push(site)
    }
    await db.collection('users').updateOne({user: user}, {$set: {"profile.sites": sites, "password": hash, "profile.firstName": firstName, "profile.lastName": lastName}})
    console.log(`Existing user ${user} added to ${site}`)
  } else {
    await db.collection('users').insertOne({user, password: hash, profile: { user, firstName, lastName, email, avatar: {type: 'default', color: [0, 128, 0], initials: firstName[0] + lastName[0]}, sites: [site]}, lastLogin: null})
    console.log(`Creating new user ${user}`)
  }
  return
  //console.log(`User ${user} created`)
}

//process.on('SIGINT', async () => {
//  await client.close()
//  console.log('MongoDB disconnected on app termination')
//  process.exit(0)
//})

// if (process.argv.length > 3) { 
//   run(process.argv[2], process.argv[3])
// }
// else {
//   console.log('Usage: create-users <site> <users.csv>')
// }

exports.createUsers = run
