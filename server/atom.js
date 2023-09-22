function dateFormat(date) {
  function two(n) {
    return n.toString().padStart(2, '0')
  }
  const d = new Date(date)
  return `${two(d.getMonth() + 1)}/${two(d.getDate())}/${d.getFullYear()} ${d.getHours()}:${two(d.getMinutes())}`
}

// https://pawelgrzybek.com/simple-rss-atom-and-json-feed-for-your-blog/
// Feed validation service: https://validator.w3.org/feed/

// 1. Test using /atom/test
// 2. Then associate a UUID with each site [generate at creation time]
// 3. Expose the feed on the UI

const splitUrls = (s) => {
  // create a list of string separated by urls
  const arr = s.split(/(https?:\/\/[^\s]+)/)
  const result = []
  result.push(arr[0])
  for (let idx = 1; idx < arr.length; idx += 2) {
    result.push(`<a href="${arr[idx]}" target="_blank">${arr[idx]}</a>`)
    result.push(arr[idx + 1])
  }
  return result
}

const htmlizeContent = ({content}) => {
  if (typeof(content) === 'string') {
    return splitUrls(content)
  }
  else if (typeof(content) === 'object' && content[0] === 'pre') {
    return `<pre>${ content[1] }</pre>`
  }
  else if (typeof(content) === 'object') {
    let result = splitUrls(content[1])
    for (const c of content[0]) {
      if (c === 'b') {
        result = `<b>${ result }</b>`
      }
      else if (c === 'i') {
        result = `<i>${ result }</i>`
      }
      else if (c === 't') {
        result = `<tt>${ result }</tt>`
      }
    }
    return result
  }
}

const createAtomItem = (uuid) => (msg) => {
  ///console.dir(msg, {depth:null})
  let content = ''
  const show = (content) => {
    if (typeof(content) === 'string') {
      return content
    }
    else {
      return `[${content[0]}]${content[1]}[/${content[0]}]`
    }
  }
  const name = `${msg.user[0].profile.firstName} ${msg.user[0].profile.lastName[0]}.`
  if (msg.what.type === 'text') {
    const d = dateFormat(msg.when)
    content = `<div xmlns="http://www.w3.org/1999/xhtml"><b>${name} ${d}</b> — ${msg.what.message}</div>`
    clean_content = msg.what.message.slice(0, 30)
  }
  else if (msg.what.type === 'md') {
    const d = dateFormat(msg.when)
    content = `<div xmlns="http://www.w3.org/1999/xhtml"><b>${name} ${d}</b> — ${msg.what.message.map(show).join('')}</div>`
    clean_content = msg.what.message.map(htmlizeContent).join('').slice(0, 30)
  }
  else {
    content = '<div xmlns="http://www.w3.org/1999/xhtml"><b>${name} ${d}</b> — [non-text message]</div>'
    clean_content = '[non-text message]'
  }
  const date = new Date(msg.when)
  return `
 <entry>
   <author><name></name></author>
   <content type="xhtml"> ${content} </content>
   <title>${clean_content.slice(0, 30)}</title>
   <id>https://chat.rpucella.net/atom/${uuid}/${msg._id.toString()}</id>
   <updated>${date.toISOString()}</updated>
 </entry>
`
}

const createAtom = (site, uuid, messages) => {
  let updated = '2000-01-0-1T00:00:00Z'
  const lastIndex = messages.lastIndexOf()
  if (lastIndex >= 0) {
    updated = (new Date(messages[lastIndex].when)).toISOString()
  }
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
 <title>${site}</title>
 <updated>${updated}</updated>
 <id>https://chat.rpucella.net/atom/${uuid}</id>
 ${messages.map(createAtomItem(uuid)).join('\n')}
</feed>
`
}


// <author>
//   <name>Riccardo Pucella</name>
//   <email>riccardo.pucella@olin.edu</email>
// </author>



exports.createAtom = createAtom
