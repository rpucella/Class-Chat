const express = require('express')
const busboy = require('express-busboy')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const { MongoClient } = require('mongodb')
const { Storage } = require('@google-cloud/storage')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// jwt: https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs

const app = express()
const port = process.env.PORT

const _ACCESS_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET
const _BUCKET_NAME = 'classchat-submissions'

// TODO - use this consistently - define an API which you can instantiate with a test class or a MongoBD class

const _TEST = (process.argv.length > 2 && process.argv[2] == '--test') ? true : false

//const uri = 'mongodb://natalia.local?retryWrites=true&writeConcern=majority'
const uri = process.env.MONGODB
let client

const defaultChannel = 'Main'

busboy.extend(app, {
  upload: true,
  path: '/tmp'
})

let _USER_OVERRIDE = false

const run = async () => {
  if (_TEST) {
    console.log('Test mode')
  }
  if (process.argv.length > 2) {
    _USER_OVERRIDE = process.argv[2]
    console.log(`Running as ${_USER_OVERRIDE}`)
  }
  client = new MongoClient(uri, {useUnifiedTopology: true})
  await client.connect()
  app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
}

app.use(cookieParser())

// const nocache = require('nocache')
// app.use(nocache())

const authenticateToken = (req, res, next) => {
  if (_USER_OVERRIDE) {
    req.user = _USER_OVERRIDE
    next()
    return
  }
  const token = req.cookies.jwt
  ///console.log('token = ', token)
  if (token == null) {
    return res.sendStatus(401) // if there isn't any token
  }
  ///console.log('time = ', Math.floor(Date.now() / 1000))
  try { 
    const user = jwt.verify(token, _ACCESS_TOKEN_SECRET)
    req.user = user
    ///console.log(user)
    next() // pass the execution off to whatever request the client intended
  }
  catch(err) {
    ///console.log('verification failed')
    return res.sendStatus(403)
  }
}

const _mkUnit = (style, currentStr) => {
  if (style.size === 0) {
    return currentStr
  }
  if (style.has('pre')) {
    return ['pre', currentStr]
  }
  return [Array.from(style).join(''), currentStr]
}

const parseMarkdown = (txt) => {
  let currentObj = []
  let currentStr = ''
  let style = new Set()
  for (let i = 0; i < txt.length; i++) {
    if (txt[i] === '*') {
      if (style.has('pre')) {
        currentStr += '*'
      }
      else if (i <= txt.length - 2 && txt[i + 1] === '*') {
        if (style.has('b')) {
          const un = _mkUnit(style, currentStr)
          currentObj.push(un)
          currentStr = ''
          style.delete('b')
        }
        else {
          const un = _mkUnit(style, currentStr)
          currentObj.push(un)
          currentStr = ''
          style.add('b')
        }
        i++
      }
      else {
        if (style.has('i')) {
          const un = _mkUnit(style, currentStr)
          currentObj.push(un)
          currentStr = ''
          style.delete('i')
        }
        else {
          const un = _mkUnit(style, currentStr)
          currentObj.push(un)
          currentStr = ''
          style.add('i')
        }
      }
    }
    else if (txt[i] === '`') {
      if (i <= txt.length - 3 && txt[i + 1] === '`' && txt[i + 2] === '`') {
        if (style.has('pre')) {
          const un = _mkUnit(style, currentStr)
          currentObj.push(un)
          currentStr = ''
          style.delete('pre')
        }
        else {
          const un = _mkUnit(style, currentStr)
          currentObj.push(un)
          currentStr = ''
          // ``` clears out everything else
          style.clear()
          style.add('pre')
        }
        i += 2
      }
      else if (style.has('pre')) {
        currentStr += txt[i]
      }
      else if (style.has('t')) {
        const un = _mkUnit(style, currentStr)
        currentObj.push(un)
        currentStr = ''
        style.delete('t')
      }
      else {
        const un = _mkUnit(style, currentStr)
        currentObj.push(un)
        currentStr = ''
        style.add('t')
      }
    }
    else {
      currentStr += txt[i]
    }
  }
  if (currentStr.length > 0) {
    const un = _mkUnit(style, currentStr)
    currentObj.push(un)
  }
  return currentObj
}

app.post('/api/post-message', authenticateToken, async (req, res) => {
  try {
    const who = req.body.who
    const what = req.body.what
    const where = req.body.where
    ///console.log('[Call to /api/post-message]')
    const ts = Date.now()
    const db = client.db('classChat')
    if (what.type === 'text') { 
      await db.collection('messages').insertOne({what, who, when: ts, where: where})
    }
    else if (what.type === 'md') {
      const msgObj = parseMarkdown(what.message)
      const new_what = {
        type: 'md',
        message: msgObj
      }
      await db.collection('messages').insertOne({what: new_what, who, when: ts, where: where})
    }
    res.send({result: 'ok'})
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

const pad = (n) => {
    const s = '00' + n
    return s.slice(s.length - 2, s.length)
}

const dateStr = (d) => { 
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
}

app.post('/api/post-submission', authenticateToken, async (req, res) => {
  try {
    const user = req.body.user
    const selection = req.body.selection
    const upload = req.files.file
    const ts = dateStr(new Date())
    //console.log(upload)
    //console.log(`user = ${user}, file = ${upload}, selection = ${selection}, ts = ${ts}`)
    //console.log(fs.statSync(upload.file))
    const storage = new Storage()
    const destFile = `${selection}/${user}/${ts}/${upload.filename}`
    const options = {
      'destination': destFile
    }
    await storage.bucket(_BUCKET_NAME).upload(upload.file, options)
    //console.log(`${upload.file} uploaded to ${_BUCKET_NAME}`);
    fs.unlinkSync(upload.file)
    res.send({result: 'ok'})
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

app.post('/api/get-feedbacks', authenticateToken, async (req, res) => {
  try {
    const where = req.body.where
    const user = req.body.user
    const keyPrefix = `${where}/feedback/${user}/`
    const storage = new Storage()
    const [files] = await storage.bucket(_BUCKET_NAME).getFiles()
    const result = files.filter(f => f.name.startsWith(keyPrefix)).map(f => f.name.slice(keyPrefix.length))
    res.send({result: 'ok', feedbacks: result})
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

app.post('/api/get-submissions', authenticateToken, async (req, res) => {
  try {
    const where = req.body.where
    const user = req.body.user
    const storage = new Storage()
    const [files] = await storage.bucket(_BUCKET_NAME).getFiles()
    // Format looks like:
    //     homework1/smadan@olin.edu/2022-01-30-17-56-21/homework1.ml
    //     downloaded/homework4/awenstrup@olin.edu/2021-11-01-00-49-00/homework4.sql
    const process = (line, metadata) => {
      const items = line.split('/')
      if (items.length === 5 && items[0] === 'downloaded') {
        if (items[2] === user) {
          // Got one.
          return {
            'name': items[1],
            'time': items[3],
            'file': items[4],
            'size': metadata.size
          }
        }
      }
      else if (items.length === 4) {
        if (items[1] === user) {
          // Got one.
          return {
            'name': items[0],
            'time': items[2],
            'file': items[3],
            'size': metadata.size
          }
        }
      }
      // Skip by default.
      return false
    }
    const result = files.map(f => process(f.name, f.metadata)).filter(f => !!f)
    res.send({result: 'ok', submissions: result})
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

app.post('/api/get-feedback', async (req, res) => { //authenticateToken, async (req, res) => {
  try {
    const where = req.body.where
    const user = req.body.user
    const feedback = req.body.feedback
    const key = `${where}/feedback/${user}/${feedback}`
    const storage = new Storage()
    const [content] = await storage.bucket(_BUCKET_NAME).file(key).download()
    const result = content.toString()
    res.send({result: 'ok', feedback: result})
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

app.post('/api/get-messages', authenticateToken, async (req, res) => {
  try { 
    const since = req.body.since
    const where = req.body.where
    ///console.log('[Call to /api/get-messages]')
    var result;
    const db = client.db('classChat')
    if (since) { 
      result = await db.collection('messages')
	.aggregate([{$match: {where: where, when: { $gt: since }}},
		    {$lookup: { from: 'users', localField: 'who', foreignField: 'user', as: 'user' }},
		    {$project: {'what': 1, 'when': 1, 'where': 1, 'who': 1, 'user.profile.firstName': 1, 'user.profile.lastName': 1, 'user.profile.avatar': 1, 'highlight': 1}}])
	.toArray()
    }
    else {
      result = await db.collection('messages')
	.aggregate([{$match: {where: where}},
		    {$lookup: { from: 'users', localField: 'who', foreignField: 'user', as: 'user' }},
		    {$project: {'what': 1, 'when': 1, 'where': 1, 'who': 1, 'user.profile.firstName': 1, 'user.profile.lastName': 1, 'user.profile.avatar': 1, 'highlight': 1}}])
	.toArray()
    }
    res.send({result: 'ok', messages: result})
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

async function getRelevantSites(db, profile) {
  const userSites = profile.sites || [profile.site]
  const sites = {}
  const sitesList = await db.collection('sites').find({site: {$in: userSites}}).forEach(obj => {
    sites[obj.site] = obj
  })
  ///console.log('sites =', sites)
  return sites
}

app.post('/api/get-profile', authenticateToken, async (req, res) => {
  try {
    // if we get here, we're authenticated!
    const token = req.cookies.jwt
    const profile = jwt.decode(token).profile
    const db = client.db('classChat')
    const sites = await getRelevantSites(db, profile)
    // Add map from sites to info about them.
    // Note that this means that `sitesObj` is never empty!
    profile.sitesObj = sites   
    res.send({result: 'ok', profile})
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

app.post('/api/signin', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password
    const db = client.db('classChat')
    const user = await db.collection('users').findOne({user: username})
    let comp = false   // by default, disallow
    if (_USER_OVERRIDE && username === _USER_OVERRIDE) {
      comp = true
    }
    else { 
      comp = await bcrypt.compare(password, user?.password)
    }
    ///console.log(user)
    if (user && comp) {
      const ts = Date.now()
      // record this as last login
      await db.collection('users').updateOne({user: username}, {$set: {lastLogin: ts}})
      const sites = await getRelevantSites(db, user.profile)
      // JWT expires after 180 days
      user.profile.sitesObj = sites
      const expiresIn = 180 * 24 * 60 * 60
      const token = jwt.sign({profile: user.profile}, _ACCESS_TOKEN_SECRET, {expiresIn})
      res.cookie('jwt', token, {
	// 4 weeks
	maxAge: 604800000,
	httpOnly: true,
	sameSite: 'strict'
      })
      res.send({result: 'ok', profile: user.profile})
    }
    else {
      res.send({result: 'error', message: 'Wrong username or password'})
    }
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

app.post('/api/signout', async (req, res) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'strict'
    })
    res.send({result: 'ok'})
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

app.use(express.static('build', {etag: false, lastModified: false}))

app.use('*', async (req, res) => {
  // for @reach/router
  res.sendFile('build/index.html', {root: path.join(__dirname, '..')})
})

process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})

run()
