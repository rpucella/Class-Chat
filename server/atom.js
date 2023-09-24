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
  result.push(escapeXml(arr[0]))
  for (let idx = 1; idx < arr.length; idx += 2) {
    result.push(`<a href="${arr[idx]}" target="_blank">${arr[idx]}</a>`)
    result.push(escapeXml(arr[idx + 1]))
  }
  return result
}

// Need to sanitize before putting in an XML object:
//   https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript

const escapeXml = (unsafe) => {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
    case '<': return '&lt;';
    case '>': return '&gt;';
    case '&': return '&amp;';
    case '\'': return '&apos;';
    case '"': return '&quot;';
    }
  })
}

//
// Also may need to block paths:
//   https://stackoverflow.com/questions/33489873/block-a-url-path-on-google-appengine

const htmlContent = (content) => {
  if (typeof(content) === 'string') {
    return splitUrls(content).join('')
  }
  else if (typeof(content) === 'object' && content[0] === 'pre') {
    return `<pre>${ escapeXml(content[1]) }</pre>`
  }
  else if (typeof(content) === 'object') {
    let result = splitUrls(content[1]).join('')
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

const cleanContent = (content) => {
  if (typeof(content) === 'string') {
    return content
  }
  else if (typeof(content) === 'object') {
    return content[1]
  }
}

const TITLE_CUT = 50

const BASE_URL = 'https://chat.rpucella.net'

const createAtomItem = (uuid, site) => (msg) => {
  ///console.dir(msg, {depth:null})
  let content = ''
  let clean_content = ''
  const name = `${msg.user[0].profile.firstName} ${msg.user[0].profile.lastName[0]}.`
  if (msg.what.type === 'text') {
    content = msg.what.message
    clean_content = msg.what.message
  }
  else if (msg.what.type === 'md') {
    content = msg.what.message.map(htmlContent).join('')
    clean_content = msg.what.message.map(cleanContent).join('')
  }
  else {
    content = '[non-text message]'
    clean_content = '[non-text message]'
  }
  const date = new Date(msg.when)
  content = `<div xmlns="http://www.w3.org/1999/xhtml"><b>(${name})</b> — ${content}</div>`
  if (clean_content.length > TITLE_CUT) {
    clean_content = clean_content.slice(0, TITLE_CUT) + '...'
  }
  return `
 <entry>
   <author><name>${name}</name></author>
   <content type="xhtml">${content}</content>
   <title>${clean_content}</title>
   <id>${BASE_URL}/atom/${uuid}/${msg._id.toString()}</id>
   <updated>${date.toISOString()}</updated>
   <link rel="alternate" href="${BASE_URL}/${site}" />
 </entry>
`
}

const createAtom = (title, name, uuid, messages) => {
  let updated = '2000-01-01T00:00:00Z'
  if (messages.length > 0) {
    updated = (new Date(messages[messages.length - 1].when)).toISOString()
  }
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
 <link rel="self" type="application/atom+xml"
       href="${BASE_URL}/atom?feed=${uuid}"/>
 <title>${title}</title>
 <updated>${updated}</updated>
 <id>${BASE_URL}/atom?feed=${uuid}</id>
 ${messages.map(createAtomItem(uuid, name)).join('\n')}
</feed>
`
}


// <author>
//   <name>Riccardo Pucella</name>
//   <email>riccardo.pucella@olin.edu</email>
// </author>

exports.createAtom = createAtom
