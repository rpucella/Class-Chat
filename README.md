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


## Google App Engine

To re-deploy:

    yarn build
    gcloud app deploy

Note that the creates a new version, the old version is still around - it should be deleted manually?
