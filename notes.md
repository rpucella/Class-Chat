# Notes

To do:

- Update 'last login' with "last time login has been checked against the table?" - or is that too frequent?

- cache messages in localstore so that it doesn't hurt when you hit refresh?
- post images
- markdown (italics, bold)
- emojis
- notifications
- split by date?
- merge messages that are from the same person within a minute? or a given time span?
- pinned posts / announcements / featured posts

- pull only when you have focus (when you don't have focus, pull everuy N minutes?)

- favicon
- maintenance mode (using a dedicated metadata table in the DB?)

- make list of "submissible" files be a parameter in the DB so that it doesn't require a re-deploy


## Versioning

- have a version endpoint   /version 
- don't put version in the frontend (so that we don't need to recompile when making a change to the backend only)


## Users

Add userId to users

- don't delete users, but have an 'active' flag
- use userId in messages instead of user name
- load user table [map from userId -> whatever when relevant]
- maybe put a note that a user is deactivated as part of the display name?


## Channels

Add channel to messages - default to 'Main' if not present

Table `sites`:

- site ID
- site name (to display in title)
- channels (including the default 'Main' channel)


## Avatars

Associate an image file (formats) with each user, to display when messages are shown

Issue: 

- don't want to put the avatar in the messages [too expensive]
- so when you first log in, you should get a list of user IDs + their avatars (and display names) for your site
- that list should be cached
- figure out a way to pass new user information if somebody changes something so that the client can update its cache


## Cheats

How to add 'site' to all profiles:

  db.users.update({}, {$set: {"profile.site": "webdev-sp21"}}, {upsert: false, multi:true})


## Admin commands

Reset/change password command

