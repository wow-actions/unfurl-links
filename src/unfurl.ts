import * as core from '@actions/core'
import { JSDOM } from 'jsdom'
import { unfurl } from 'unfurl.js'
import { compile } from 'handlebars'

export namespace Unfurl {
  function getLinks(html: string) {
    const links: string[] = []

    // Parse the HTML
    const frag = JSDOM.fragment(html)
    const raw = core.getInput('raw') !== 'false'

    // Check if the content came from an email
    const isEmail = !!frag.querySelectorAll('.email-fragment').length

    if (!isEmail) {
      // Find all the links
      frag.querySelectorAll('a').forEach((a) => {
        // Only unfurl raw links. GitHub also adds a trailing `/`
        if (!raw || a.href === a.innerHTML || a.href === `${a.innerHTML}/`) {
          links.push(a.href)
        }
      })
    }

    // Avoid duplicate identical links
    return Array.from(new Set(links))
  }

  interface Metadata {
    url: string
    header?: string
    title?: string
    titleLink?: string
    authorName?: string
    authorIcon?: string
    authorLink?: string
    thumb?: string
    content?: string
    image?: string
    footer?: string
    footerLink?: string
    footerIcon?: string
  }

  async function getMetadata(url: string): Promise<Metadata> {
    const data = await unfurl(url, { oembed: true })
    const ogps = data.open_graph
    const cards = data.twitter_card
    const header = core.getInput('header')
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

    const thumb = hasThumb
      ? (ogp && ogp.images && ogp.images[0] && ogp.images[0].url) ||
        (card && card.images && card.images[0] && card.images[0].url) ||
        (embed &&
          embed.thumbnails &&
          embed.thumbnails[0] &&
          embed.thumbnails[0].url)
      : undefined

    return {
      url,
      header,
      title,
      titleLink,
      authorName,
      authorLink,
      content,
      thumb,
    }
  }

  const defaultTemplate = `
    <blockquote>
      {{#if header }}
        {{{ header }}}
      {{/if}}

      {{#if thumb }}
        <img src="{{ thumb }}" width="48" align="right" />
      {{/if}}

      {{#if authorName }}
        <div>
          {{#if authorIcon }}
            <img src="{{ authorIcon }}" height="14" />
          {{/if}}
          {{#if authorLink }}
            <a href="{{ authorLink }}">{{ authorName }}</a>
          {{else}}
            {{ authorName }}
          {{/if}}
        </div>
      {{/if}}

      {{#if title }}
        <div>
          <strong>
            {{#if titleLink }}
              <a href="{{ titleLink }}">{{ title }}</a>
            {{else}}
              {{ title }}
            {{/if}}
          </strong>
        </div>
      {{/if}}

      {{#if content }}
        <div>{{ content }}</div>
      {{/if}}

      {{#if image }}
        <br/>
        <img src="{{image}}" />
      {{/if}}

      {{#if footer }}
        <h6>
          {{#if footerIcon }}
            <img src="{{ footerIcon }}" height="14" />
            {{/if}}
          {{#if footerLink }}
            <a href="{{ footerLink }}">{{ footer }}</a>
          {{else}}
            {{ footer }}
          {{/if}}
        </h6>
      {{/if}}

    </blockquote>
  `

  export async function parse(html: string) {
    // https://regex101.com/r/m6GyIi/1
    const regex = /[\r\n\s]*<!--\s*unfurl\s+begin\s*-->([\S\s]*?)[\r\n\s]*<!--\s*unfurl\s+end\s*-->[\r\n\s]*/gm
    const raw = html.replace(regex, '')
    const links = getLinks(raw)

    core.debug(`html: ${html}`)
    core.debug(`raw: ${raw}`)
    core.debug(`links: ${links}`)

    if (links.length) {
      const template = core.getInput('template') || defaultTemplate
      const render = compile(template)

      const contents = await Promise.all(
        links.map((link) =>
          getMetadata(link).then((data) => {
            if (data.header) {
              data.header = compile(data.header)(data)
            }
            return render(data).trim()
          }),
        ),
      )

      const prefix = '<!-- unfurl begin -->'
      const suffix = '<!-- unfurl end -->'

      return `${raw}\n\n${prefix}\n\n${contents.join('')}\n\n${suffix}`
    }

    return null
  }
}
