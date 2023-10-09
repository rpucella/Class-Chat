/* A script to run an ad-hoc function over the database */

const bcrypt = require('bcrypt')
const fs = require('fs')
const https = require('https')
const { MongoClient } = require('mongodb')
require('dotenv').config()

const uri = process.env.MONGODB
const client = new MongoClient(uri, {useUnifiedTopology: true})

// Format of users file:
// email, last name, first name


async function run() {
  try {
    await client.connect()
    const db = client.db('classChat')

    const result = await db.collection('users').find({'profile.sites': 'dsa-fa22'}).toArray()
    for (const r of result) {
      console.log(r)
    }

    //await db.collection('users').updateMany({'profile.sites': 'dsa-sp22'}, { '$set': { 'profile.sites.$': 'dsa-fa22'} })
    
    await client.close()
  } catch (err) {
    console.error(err)
  }
}

process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})

run()
