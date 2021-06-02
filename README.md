# ClassChat

To build:

    yarn build
    
To start the server:

    yarn start
    
Defaults to port 8502

(`yarn dev` will start the dev server, but with nowhere to communicate.)

The server needs to communicate with a MongoDB instance.

To run the server locally, you need a .env file in the root folder with the following variables:

    PORT=8502
    MONGODB=<url to mongoDB instance>
    JWT_TOKEN_SECRET=<some secret with which to sign the JWT>


## Installing MongoDB locally

To install:

    brew tap mongodb/brew
    brew install mongodb-community@4.4
    
To start and stop MongoDB:

    brew services start mongodb-community@4.4
    brew services stop mongodb-community@4.4
    
The CLI is:

    mongo

The MongoDB config file:

    /usr/local/etc/mongod.conf
    
If you want to enable remote access to MongoDB, set `bindIp` to `0.0.0.0` in the config file:

    net:
      bindIp: 0.0.0.0


## Google App Engine

To re-deploy:

    gcloud app deploy

Note that the creates a new version, the old version is still around - it should be deleted manually?

Notes on setting up a custom domain: 

- https://cloud.google.com/appengine/docs/standard/nodejs/mapping-custom-domains

In Google Domains, added a CNAME to https://ghs.googlehosted.com - that seemed to be enough...



## Google Cloud Info

Google App Engine NodeJS standard: https://cloud.google.com/appengine/docs/standard/nodejs

Google Cloud SDK:  https://cloud.google.com/sdk/docs/install

Deploy React NodeJS + MongoDB to Google Cloud:  https://paulrohan.medium.com/deploying-a-react-node-mongodb-app-to-google-cloud-platforms-google-app-engine-1ba680447d59

app.yaml configuration file:  https://cloud.google.com/appengine/docs/standard/nodejs/config/appref

Create a local authentication file for Google Storage: `gcloud auth application-default login`

- Seems to create a file in `.config/gcloud/application_default_credentials.json`

Potential bug about caching with express:  https://issuetracker.google.com/issues/168399701   and see also:  https://stackoverflow.com/questions/63732121/google-app-engine-index-html-cached-after-deploy-in-express-react-app
