# Notes


## Cheats

How to add 'site' to all profiles:

  db.users.update({}, {$set: {"profile.site": "site-name"}}, {upsert: false, multi:true})


## Google Cloud Info

Install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install

Notes on setting up a custom domain: 

- https://cloud.google.com/appengine/docs/standard/nodejs/mapping-custom-domains

In Google Domains, added a CNAME to https://ghs.googlehosted.com - that seemed to be enough...

Google App Engine NodeJS standard: https://cloud.google.com/appengine/docs/standard/nodejs

Deploy React NodeJS + MongoDB to Google Cloud:  https://paulrohan.medium.com/deploying-a-react-node-mongodb-app-to-google-cloud-platforms-google-app-engine-1ba680447d59

app.yaml configuration file:  https://cloud.google.com/appengine/docs/standard/nodejs/config/appref

Create a local authentication file for Google Storage: `gcloud auth application-default login`

- Seems to create a file in `.config/gcloud/application_default_credentials.json`

Potential bug about caching with express:  https://issuetracker.google.com/issues/168399701   and see also:  https://stackoverflow.com/questions/63732121/google-app-engine-index-html-cached-after-deploy-in-express-react-app
