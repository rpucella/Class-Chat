
const bcrypt = require('bcrypt')
const { MongoClient, ObjectID } = require('mongodb')
const {Storage} = require('@google-cloud/storage')
require('dotenv').config()

const uri = process.env.MONGODB   // 'mongodb://natalia.local?retryWrites=true&writeConcern=majority'
const client = new MongoClient(uri, {useUnifiedTopology: true})

const BUCKET_NAME = 'classchat-submissions'

function run(command, args) {
  switch (command) {
  case 'create-user':
    if (args.length !== 6) {
      console.log('USAGE: create-user <username> <password> <first name> <last name> <email> <site>')
      return
    }
    create_user(args[0], args[1], args[2], args[3], args[4], args[5])
    return

  case 'create-password':
    if (args.length !== 1) {
      console.log('USAGE: create-password <password>')
      return
    }
    create_password(args[0])
    return

  case 'logins':
    if (args.length !== 1) {
      console.log('USAGE: logins <site>')
      return
    }
    logins(args[0])
    return

  case 'sites':
    if (args.length !== 0) {
      console.log('USAGE: sites')
      return
    }
    sites()
    return

  case 'messages':
    if (args.length !== 1) {
      console.log('USAGE: messages <site>')
      return
    }
    messages(args[0])
    return

  case 'highlight':
    if (args.length !== 1) {
      console.log('USAGE: highlight <id>')
      return
    }
    highlight(args[0])
    return

  case 'submissions':
    submissions()
    return

  case 'download':
    if (args.length !== 1) {
      console.log('USAGE: download <key-prefix>')
      return
    }
    download_files(args[0])
    return

  case 'delete':
    if (args.length !== 1) {
      console.log('USAGE: delete <key>')
      return
    }
    delete_file(args[0])
    return

  /*
  case 'adhoc':
    adhoc()
    return
  */
    
  default:
    console.log('Unknown command: ' + command)
  }
}

async function create_user(user, password, firstName, lastName, email, site) {
  await client.connect()
  const db = client.db('classChat')
  const hash = await bcrypt.hash(password, 10)
  await db.collection('users').insertOne({user, password: hash, profile: { user, firstName, lastName, email: email, avatar: null, sites: [site]}, lastLogin: null})
  console.log(`User ${user} created`)
  await client.close()
}

async function create_password(password) {
  const hash = await bcrypt.hash(password, 10)
  console.log('Hash = ', hash)
}

function dateFormat(date) {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`
}

function pad(s, width) {
  const ss = s + new Array(width).join(' ')
  return ss.slice(0, width)
}

async function logins(site) {
  await client.connect()
  const db = client.db('classChat')
  const users = await db.collection('users').find({'profile.site': {$eq: site}})
  console.log('------------------------------------------------------------')
  await users.forEach((j) => {
    const d = j.lastLogin ? dateFormat(j.lastLogin) : '--'
    console.log(`${pad(j.profile.lastName + ', ' + j.profile.firstName, 40)}${d}`)
  })
  console.log('------------------------------------------------------------')
  await client.close()
}

async function sites() {
  await client.connect()
  const db = client.db('classChat')
  const sites = await db.collection('sites').find()
  console.log('------------------------------------------------------------')
  await sites.forEach((j) => {
    console.log(`${pad(j.site, 30)}${j.name}`)
  })
  console.log('------------------------------------------------------------')
  await client.close()
}

async function messages(site) {
  await client.connect()
  const db = client.db('classChat')
  const users = await db.collection('messages').find({'where': {$eq: site}})
  const show = (content) => {
    if (typeof(content) === 'string') {
      return content
    }
    else {
      return `[${content[0]}]${content[1]}[/${content[0]}]`
    }
  }
  console.log('------------------------------------------------------------')
  await users.forEach((j) => {
    if (j.what.type === 'text') {
      const d = dateFormat(j.when)
      const highlighted = j.highlight ? '[*]' : ''
      console.log('')
      console.log(j.who, '-', d, '-', j._id, highlighted)
      console.log('"' + j.what.message + '"')
    }
    else if (j.what.type === 'md') {
      const d = dateFormat(j.when)
      const highlighted = j.highlight ? '[*]' : ''
      console.log('')
      console.log(j.who, '-', d, '-', j._id, highlighted)
      console.log('"' + j.what.message.map(show).join('') + '"')
    }
    else {
      console.log('<non-text-messages>')
    }
  })
  console.log('------------------------------------------------------------')
  await client.close()
}

/*
async function adhoc() {
  // Hoook point to do something ad hoc.
  await client.connect()
  const db = client.db('classChat')
  const users = await db.collection('messages').updateMany({'where': 'Test'}, {$set: {where: 'test'}})
  await client.close()
}
*/

async function highlight(id) {
  await client.connect()
  const db = client.db('classChat')
  const result = await db.collection('messages').updateOne({_id: ObjectID(id)}, {$set: {highlight: true}})
  console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
  )
  console.log(`Message ${id} highlighted`)
  await client.close()
}

async function submissions() {
  const storage = new Storage()
  // Lists files in the bucket
  const [files] = await storage.bucket(BUCKET_NAME).getFiles()
  console.log('------------------------------------------------------------')
  files.forEach(file => {
    console.log(file.name)
  })
  console.log('------------------------------------------------------------')
}

async function download_file(storage, key) {
  const destFile = key.replace(/\//g, '-')
  const newKey = `downloaded/${key}`
  const options = {
    'destination': destFile
  }
  console.log(
    `File gs://${BUCKET_NAME}/${key}`
  )
  await storage.bucket(BUCKET_NAME).file(key).download(options)
  console.log(`  Downloaded to ${destFile}`)
  if (!key.startsWith('downloaded/')) {
    // only rename if we're not starting with downloaded/
    await storage.bucket(BUCKET_NAME).file(key).rename(newKey)
    console.log(`  Renamed to ${newKey}`)
  }
}

async function download_files(keyPrefix) {
  const storage = new Storage()
  // Lists files in the bucket
  const [files] = await storage.bucket(BUCKET_NAME).getFiles()
  for (const file of files) {
    if (file.name.startsWith(keyPrefix)) {
      await download_file(storage, file.name)
    }
  }
}

async function delete_file(key) {
  const storage = new Storage()
  const destFile = key.replace(/\//g, '-')
  console.log(
    `File gs://${BUCKET_NAME}/${key}`
  )
  await storage.bucket(BUCKET_NAME).file(key).delete()
  console.log(`  Deleted`)
}

process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})

if (process.argv.length > 2) {
  run(process.argv[2], process.argv.slice(3))
}
else {
  console.log('USAGE: <command> [args]')
  console.log('')
  console.log('Commands:')
  console.log('  create-user <username> <password> <first name> <last name> <email> <site>')
  console.log('  create-password <password>')
  console.log('  logins <site>')
  console.log('  sites')
  console.log('  messages <site>')
  console.log('  highlight <id>')
  console.log('  submissions')
  console.log('  download <key>')
  console.log('  delete <key>')
}

