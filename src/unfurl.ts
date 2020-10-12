import * as core from '@actions/core'
import { JSDOM } from 'jsdom'
import { unfurl } from 'unfurl.js'
import { Template } from './template'

export namespace Unfurl {
  function getLinks(html: string) {
    const links: string[] = []

    // Parse the HTML
    const frag = JSDOM.fragment(html)

    // Check if the content came from an email
    const isEmail = !!frag.querySelectorAll('.email-fragment').length

    if (!isEmail) {
      // Find all the links
      frag.querySelectorAll('a').forEach((a) => {
        // Only unfurl raw links. GitHub also adds a trailing `/`
        if (a.href === a.innerHTML || a.href === `${a.innerHTML}/`) {
          links.push(a.href)
        }
      })
    }

    // Avoid duplicate identical links
    return Array.from(new Set(links))
  }

  async function getMetadata(url: string): Promise<Template.Metadata> {
    const data = await unfurl(url, { oembed: true })
    const ogps = data.open_graph
    const cards = data.twitter_card
    const hasThumb = core.getInput('thumb') !== 'false'

    const ogp = Array.isArray(ogps) ? ogps[0] : ogps
    const card = Array.isArray(cards) ? cards[0] : cards
    const embed = data.oEmbed

    const content =
      (ogp && ogp.description) || (card && card.description) || data.description

    const title = (ogp && ogp.title) || (card && card.title) || data.title
    const titleLink = (ogp && ogp.url) || url

    const authorName = embed && embed.author_name
    const authorLink = embed && embed.author_url

    const thumbUrl = hasThumb
      ? (ogp && ogp.images && ogp.images[0] && ogp.images[0].url) ||
        (card && card.images && card.images[0] && card.images[0].url) ||
        (embed &&
          embed.thumbnails &&
          embed.thumbnails[0] &&
          embed.thumbnails[0].url)
      : undefined

    return {
      title,
      titleLink,
      authorName,
      authorLink,
      content,
      thumbUrl,
    }
  }

  export async function parse(html: string) {
    const prefix = '<!-- unfurl begin -->'
    const suffix = '<!-- unfurl end -->'
    const regex = new RegExp(`\\n*\\s*${prefix}(.*)\\n*\\s*${suffix}`, 'gm')
    const raw = html.replace(regex, '')
    const links = getLinks(raw)

    core.debug(`html: ${html}`)
    core.debug(`raw: ${raw}`)
    core.debug(`links: ${links}`)

    if (links.length) {
      const contents = await Promise.all(
        links.map((link) => getMetadata(link).then(Template.render)),
      )

      return `${raw}\n\n${prefix}\n\n${contents.join('')}\n\n${suffix}`
    }

    return null
  }
}
