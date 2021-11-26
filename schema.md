# Schema information

Collection `users`:

    {
      user, 
      password: hash, 
      profile: { 
        user, 
        firstName, 
        lastName, 
        email, 
        avatar: null, 
        sites 
      }, 
      lastLogin: null
    }

`avatar` can be 

    null
    
    {
      type: 'default',
      color: [r, g, b],
      initials: 'RP'
    }

Collection `messages`:

    # plain text
    {
      what: {
        type: 'text',
        message
      }, 
      who, 
      when: ts, 
      where: where
    }


    # markdown
    {
      what: {
        type: 'md',
        message
      }
      who, 
      when: ts, 
      where: where
    }

collection `sites`:

    {
      site: site,
      name: 'Nice name',
      submissions: [
        {
          submission: submission,
          name: 'Nice name'
        },
        ...
      ]
    }
