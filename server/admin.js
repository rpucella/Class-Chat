const bcrypt = require('bcrypt')
const { MongoClient, ObjectID } = require('mongodb')
const {Storage} = require('@google-cloud/storage')
const fs = require('fs')
const {createUsers} = require('./create-users.js')
const {refreshFeed} = require('./feed.js')
require('dotenv').config()

const uri = process.env.MONGODB   // 'mongodb://natalia.local?retryWrites=true&writeConcern=majority'
const client = new MongoClient(uri, {useUnifiedTopology: true})

const STORAGE_CONFIG = {
    projectId: process.env.PROJECT_ID,
    keyFilename: '.priv_key'
}

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

  case 'create-users':
    if (args.length != 2) {
      console.log('USAGE: create-users <site> <file.csv>')
      return
    }
    createUsers(args[0], args[1])
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

  case 'create-site':
    if (args.length !== 2) {
      console.log('USAGE: create-site <site> <description>')
      return
    }
    create_site(args[0], args[1])
    return

  case 'site-add-user':
    if (args.length !== 2) {
      console.log('USAGE: site-add-user <site> <username>')
      return
    }
    site_add_user(args[0], args[1])
    return

  case 'site-add-submission':
    if (args.length !== 3) {
      console.log('USAGE: site-add-submission <site> <submission key> <name>')
      return
    }
    site_add_submission(args[0], args[1], args[2])
    return

  case 'refresh-feed':
    if (args.length !== 1) {
      console.log('USAGE: refresh-feed <site>')
      return
    }
    refresh_feed(args[0])
    return

  case 'sites':
    if (args.length !== 0) {
      console.log('USAGE: sites')
      return
    }
    sites()
    return

  case 'users':
    if (args.length > 1) {
      console.log('USAGE: users [<site>]')
      return
    }
    let site = args.length === 1 ? args[0] : null
    users(site)
    return

  case 'update-name':
    if (args.length !== 3) {
      console.log('USAGE: update-name <username> <first name> <last name>')
      return
    }
    update_name(args[0], args[1], args[2])
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

  case 'read':
    if (args.length !== 1) {
      console.log('USAGE: read <key>')
      return
    }
    read_file(args[0])
    return

  case 'delete':
    if (args.length !== 1) {
      console.log('USAGE: delete <key>')
      return
    }
    delete_file(args[0])
    return

  case 'feedback':
    if (args.length != 4) {
      console.log('USAGE: feedback <site> <user> <name> <file>')
      return
    }
    add_feedback(args[0], args[1], args[2], args[3])
    return

  case 'export':
    if (args.length !== 1) {
      console.log('USAGE: export <site>')
      return
    }
    export_site(args[0])
    return
    
  default:
    console.log('Unknown command: ' + command)
  }
}

function make_avatar(firstName, lastName) {
  const init = firstName[0] + lastName[0]
  return {
    type: 'default',
    color: [0, 128, 0],
    initials: init
  }
}

async function create_user(user, password, firstName, lastName, email, site) {
  await client.connect()
  const db = client.db('classChat')
  const hash = await bcrypt.hash(password, 10)
  const avatar = make_avatar(firstName, lastName)
  await db.collection('users').insertOne({user, password: hash,
                                          profile: { user, firstName, lastName, email, avatar, sites: [site]},
                                          lastLogin: null})
  console.log(`User ${user} created`)
  await client.close()
}

async function update_name(user, firstName, lastName) {
  await client.connect()
  const db = client.db('classChat')
  const avatar = make_avatar(firstName, lastName)
  await db.collection('users').updateOne({user: user}, {$set: {"profile.firstName": firstName,
                                                               "profile.lastName": lastName,
                                                               "profile.avatar": avatar}})
  console.log(`User ${user} updated`)
  await client.close()
}

async function create_password(password) {
  const hash = await bcrypt.hash(password, 10)
  console.log('Hash = ', hash)
}

async function create_site(site, description) {
  await client.connect()
  const db = client.db('classChat')
  await db.collection('sites').insertOne({site, name: description, submissions: []})
  console.log(`Site ${site} created`)
  await client.close()
}

async function site_add_user(site, username)  {
  await client.connect()
  const db = client.db('classChat')
  const user = await db.collection('users').findOne({user: username})  //.find({'profile.site': {$eq: site}})
  const sites = user.profile.sites
  if (!sites.includes(site)) {
    sites.push(site)
    await db.collection('users').updateOne({user: username}, {$set: {"profile.sites": sites}})
    console.log(`User ${username} added to ${site}`)
  }
  await client.close()
}

async function site_add_submission(site, key, name)  {
  await client.connect()
  const db = client.db('classChat')
  const siteObj = await db.collection('sites').findOne({site: site})
  const submissions = siteObj.submissions || []
  if (submissions.map(obj => obj.submission).includes(key)) {
    console.log(`Key ${key} already exists`)
  } else {
    submissions.push({submission: key, name: name})
    await db.collection('sites').updateOne({site: site}, {$set: {"submissions": submissions}})
    console.log(`Submission ${key} added to ${site}`)
  }
  await client.close()
}

async function refresh_feed(site)  {
  await client.connect()
  const db = client.db('classChat')
  const siteObj = await db.collection('sites').findOne({site: site})
  const storage = new Storage(STORAGE_CONFIG)
  await refreshFeed(db, storage, siteObj)
  await client.close()
}

function two(n) {
  return n.toString().padStart(2, '0')
}

function dateFormat(date) {
  const d = new Date(date)
  return `${two(d.getMonth() + 1)}/${two(d.getDate())}/${d.getFullYear()} ${d.getHours()}:${two(d.getMinutes())}`
}

function pad(s, width) {
  const ss = s + new Array(width).join(' ')
  return ss.slice(0, width)
}

async function getRelevantSites(db, profile) {
  const userSites = profile.sites || [profile.site]
  const sites = {}
  const sitesList = await db.collection('sites').find({site: {$in: userSites}}).forEach(obj => {
    sites[obj.site] = obj
  })
  ///console.log('sites =', sites)
  return sites
}

async function logins(site) {
  await client.connect()
  const db = client.db('classChat')
  // Not the best way - pull all users and filter individually?
  const users = await db.collection('users').find()  //.find({'profile.site': {$eq: site}})
  console.log('------------------------------------------------------------')
  await users.forEach((j) => {
    if (j.profile.site === site || (j.profile.sites && j.profile.sites.includes(site))) {
      const d = j.lastLogin ? dateFormat(j.lastLogin) : '--'
      console.log(`${pad(j.profile.lastName + ', ' + j.profile.firstName, 40)}${d}`)
    }
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
    if (j.feed) {
      console.log(`${pad(' ', 30)}feed: ${j.feed}`)
    }
    if (j.submissions) {
      for (const sub of j.submissions) {
        console.log(`${pad(' ', 30)}- ${pad(sub.name, 20)} [${sub.submission}]`)
      }
    }
  })
  console.log('------------------------------------------------------------')
  await client.close()
}

async function users(siteOpt) {
  await client.connect()
  const db = client.db('classChat')
  const filter = siteOpt ? {'profile.sites': {$all: [siteOpt]}} : {}
  const users = await db.collection('users').find(filter)
  console.log('------------------------------------------------------------')
  await users.forEach((j) => {
    console.log(`${j.user}`)
    console.log(`  ${j.profile.firstName} ${j.profile.lastName}`)
    console.log(`  ${j.profile.sites?.join(' ')}`)
  })
  console.log('------------------------------------------------------------')
  await client.close()
}

async function messages(site) {
  await client.connect()
  const db = client.db('classChat')
  const messages = await db.collection('messages').find({'where': {$eq: site}})
  const show = (content) => {
    if (typeof(content) === 'string') {
      return content
    }
    else {
      return `[${content[0]}]${content[1]}[/${content[0]}]`
    }
  }
  console.log('------------------------------------------------------------')
  await messages.forEach((j) => {
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

const splitUrls = (s) => {
  // create a list of string separated by urls
  const arr = s.split(/(https?:\/\/[^\s]+)/)
  const result = []
  result.push(arr[0])
  for (let idx = 1; idx < arr.length; idx += 2) {
    result.push(`<a href="${arr[idx]}" target="_blank">${arr[idx]}</a>`)
    result.push(arr[idx + 1])
  }
  return result
}

async function export_site(site) {
  await client.connect()
  const db = client.db('classChat')
  const messages = await db.collection('messages')
        .aggregate([{$match: {where: {$eq: site}}},
		    {$lookup: { from: 'users', localField: 'who', foreignField: 'user', as: 'user' }},
		    {$project: {'what': 1, 'when': 1, 'where': 1, 'who': 1, 'user.profile.firstName': 1, 'user.profile.lastName': 1, 'user.profile.avatar': 1, 'highlight': 1}}])
	.toArray()
  const show = (content) => {
    if (typeof(content) === 'string') {
      return splitUrls(content).join(' ')
    }
    else if (content[0] === 't') {
      const inner = splitUrls(content[1]).join(' ')
      return `<div class="code">${inner}</div>`
    }
    else {
      const inner = splitUrls(content[1]).join(' ')
      return `<${content[0]}>${inner}</${content[0]}>`
    }
  }
  const output = []
  const style = `
    div.message {
      margin: 16px;
      padding: 8px;
      border: 1px solid #cccccc;
      border-radius: 8px;
    }

    div.header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    div.name {
      flex: 0 1 auto;
      font-weight: bold;
    }

    div.date {
      flex: 0 1 auto;
    }

    div.code {
      padding: 0.15rem;
      word-wrap: break-word;
      margin: 0;
      white-space: pre-wrap;
      font-family: monospace;
      display: inline-block;
    }
  `
  output.push(`<!DOCTYPE html><html lang="en">`)
  output.push(`<head><meta charset="utf-8" /><style>${style}</style></head>`)
  output.push(`<body>`)
  console.log('------------------------------------------------------------')
  await messages.forEach((j) => {
    ///console.dir(j, {depth:null})
    const name = (j.user && j.user.length > 0) ? `${j.user[0].profile.firstName} ${j.user[0].profile.lastName}` : `(${j.who})`
    if (j.what.type === 'text') {
      const d = dateFormat(j.when)
      const highlighted = j.highlight ? '[*]' : ''
      output.push(`<div class="message">`)
      output.push(` <div class="header"><div class="name">${name}</div>`)
      output.push(` <div class="date">${d}</div></div>`)
      output.push(` <div class="content">${j.what.message}</div>`)
      output.push(`</div>`)
    }
    else if (j.what.type === 'md') {
      const d = dateFormat(j.when)
      const highlighted = j.highlight ? '[*]' : ''
      output.push(`<div class="message">`)
      output.push(` <div class="header"><div class="name">${name}</div>`)
      output.push(` <div class="date">${d}</div></div>`)
      output.push(` <div class="content">${j.what.message.map(show).join('')}</div>`)
      output.push(`</div>`)
    }
  })
  output.push(`</body>`)
  output.push(`</html>`)
  const outFile = `${site}.html`
  fs.writeFileSync(outFile, output.join('\n'))
  console.log(`Wrote ${outFile}`)
  console.log('------------------------------------------------------------')
  await client.close()
}

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
  const storage = new Storage(STORAGE_CONFIG)
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
  const storage = new Storage(STORAGE_CONFIG)
  // Lists files in the bucket
  const [files] = await storage.bucket(BUCKET_NAME).getFiles()
  for (const file of files) {
    if (file.name.startsWith(keyPrefix)) {
      await download_file(storage, file.name)
    }
  }
}

async function read_file(key) {
  const storage = new Storage(STORAGE_CONFIG)
  const destFile = key.replace(/\//g, '-')
  console.log(
    `File gs://${BUCKET_NAME}/${key}`
  )
  const data = await storage.bucket(BUCKET_NAME).file(key).download()
  console.log('----------------------------------------------------------------------')
  console.log(data.toString())
}

async function delete_file(key) {
  const storage = new Storage(STORAGE_CONFIG)
  const destFile = key.replace(/\//g, '-')
  console.log(
    `File gs://${BUCKET_NAME}/${key}`
  )
  await storage.bucket(BUCKET_NAME).file(key).delete()
  console.log(`  Deleted`)
}

async function add_feedback(site, user, name, file) {
  const storage = new Storage(STORAGE_CONFIG)
  const key = `${site}/feedback/${user}/${name}`
  console.log(
    `File gs://${BUCKET_NAME}/${key}`
  )
  const content = fs.readFileSync(file)
  await storage.bucket(BUCKET_NAME).file(key).save(content)
  console.log(`  Uploaded from ${file}`)
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
  console.log('  create-users <site> <file.csv>')
  console.log('  create-password <password>')
  console.log('  create-site <site> <description>')
  console.log('  site-add-user <site> <username>')
  console.log('  site-add-submission <site> <submission key> <name>')
  console.log('  logins <site>')
  console.log('  sites')
  console.log('  users [<site>]')
  console.log('  update-name <username> <first name> <last name>')
  console.log('  messages <site>')
  console.log('  export <site>')
  console.log('  highlight <id>')
  console.log('  submissions')
  console.log('  read <key>')
  console.log('  download <key>')
  console.log('  delete <key>')
  console.log('  feedback <site> <user> <name> <file>')
  console.log('  refresh-feed <site>')
}

