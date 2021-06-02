const express = require('express')
const busboy = require('express-busboy')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const { MongoClient } = require('mongodb')
const { Storage } = require('@google-cloud/storage')
const fs = require('fs')
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

const run = async () => {
  if (_TEST) {
    console.log('Test mode')
  }
  client = new MongoClient(uri, {useUnifiedTopology: true})
  await client.connect()
  app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
}

app.use(cookieParser())

// const nocache = require('nocache')
// app.use(nocache())

const authenticateToken = (req, res, next) => {
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

app.post('/api/post-message', authenticateToken, async (req, res) => {
  try {
    const user = req.body.user
    const who = req.body.who
    const what = req.body.what
    const where = req.body.where
    ///console.log('[Call to /api/post-message]')
    const ts = Date.now()
    const db = client.db('classChat')
    await db.collection('messages').insertOne({user, what, who, when: ts, where: where})
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

app.post('/api/get-messages', authenticateToken, async (req, res) => {
  try { 
    const since = req.body.since
    const where = req.body.where
    ///console.log('[Call to /api/get-messages]')
    var result;
    const db = client.db('classChat')
    if (since) { 
      result = await db.collection('messages').find({when: { $gt: since }, where: where}).toArray()
    }
    else {
      result = await db.collection('messages').find({where: where}).toArray()
    }
    res.send({result: 'ok', messages: result})
  }
  catch(err) {
    console.log(err)
    res.sendStatus(500)    
  }
})

app.post('/api/get-profile', authenticateToken, async (req, res) => {
  try {
    // if we get here, we're authenticated!
    const token = req.cookies.jwt
    const profile = jwt.decode(token).profile
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
    const user = await db.collection('users').findOne({userName: username})
    const comp = await bcrypt.compare(password, user?.password)
    if (user && comp) {
      const ts = Date.now()
      // record this as last login
      await db.collection('users').updateOne({userName: username}, {$set: {lastLogin: ts}})
      // JWT expires after 1 week
      const token = jwt.sign({profile: user.profile}, _ACCESS_TOKEN_SECRET, { expiresIn: 604800 })
      res.cookie('jwt', token, {
	// 1 week
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
    const token = null
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

process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})

run()
