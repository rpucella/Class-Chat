# ClassChat

To build:

    yarn build
    
To start the server:

    yarn start
    
The server defaults to port 8502

The server needs to communicate with a MongoDB instance.

To run the server locally, you need a .env file in the root folder with the following variables:

    PORT=8502
    MONGODB=<url to mongoDB instance>
    JWT_TOKEN_SECRET=<some secret with which to sign the JWT>

Since the code also requires access to a Google Storage Cloud bucket, you'll need `gcloud` 
authorized to access the required bucket.

[Install the Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

Authenticate to Google storage: 

    gcloud auth application-default login

This probably needs to be fixed. We shouldn't need to run the `gcloud` locally just to be able to
access Google Storage. 


## Deploy on Google App Engine

To re-deploy:

    yarn build
    gcloud app deploy

Note that the creates a new version, the old version is still around - it should be deleted manually?

This requires an `app.yaml` file containing at least:

    runtime: nodejs14

    env_variables:
      MONGODB: <url to mongDB instance>
      JWT_TOKEN_SECRET: <some secret with which to sign the JWT>


You probably want some handlers as well, the details dependning on what you need, such as:

    handlers:
    - url: /.*
      script: auto
      secure: always
      redirect_http_response_code: 301


## Running MongoDB locally on Mac OS X

To install

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

