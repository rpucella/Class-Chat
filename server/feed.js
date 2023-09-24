
const { Storage } = require('@google-cloud/storage')
const { createAtom } = require('./atom.js')
const _BUCKET_NAME = 'classchat-feeds'


const refreshFeed = async (db, storage, siteObj) => {
  const where = siteObj.site
  const title = siteObj.name
  const uuid = siteObj.feed
  const messages = await db.collection('messages')
	.aggregate([{$match: {where: where}},
		    {$lookup: { from: 'users', localField: 'who', foreignField: 'user', as: 'user' }},
		    {$project: {'_id': 1, 'what': 1, 'when': 1, 'where': 1, 'who': 1, 'user.profile.firstName': 1, 'user.profile.lastName': 1, 'user.profile.avatar': 1, 'highlight': 1}}])
	.toArray()
  xml = createAtom(title, where, uuid, messages)
  ///console.log(xml)
  const destFile = `${uuid}.xml`
  await storage.bucket(_BUCKET_NAME).file(destFile).save(xml)
  await storage.bucket(_BUCKET_NAME).file(destFile).makePublic()
  await storage.bucket(_BUCKET_NAME).file(destFile).setMetadata({
    contentType: 'application/atom+xml'
  })
}

exports.refreshFeed = refreshFeed
