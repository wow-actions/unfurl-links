export namespace Template {
  export interface Metadata {
    pretext?: string
    title?: string
    titleLink?: string
    authorName?: string
    authorIcon?: string
    authorLink?: string
    thumbUrl?: string
    content?: string
    imageUrl?: string
    footer?: string
    footerLink?: string
    footerIcon?: string
  }

  // https://github.com/probot/attachments/blob/master/template.js
  export function render(data: Metadata) {
    let str = ''

    if (data.pretext) {
      str += `${data.pretext}\n`
    }

    str += '<blockquote>'

    if (data.thumbUrl) {
      str += `<img src="${data.thumbUrl}" width="48" align="right">`
    }

    if (data.authorName) {
      str += '<div>'

      if (data.authorIcon) {
        str += `<img src="${data.authorIcon}" height="14"> `
      }

      if (data.authorLink) {
        str += `<a href="${data.authorLink}">${data.authorName}</a>`
      } else {
        str += data.authorName
      }

      str += '</div>'
    }

    if (data.title) {
      str += `<div><strong>`

      if (data.titleLink) {
        str += `<a href="${data.titleLink}">${data.title}</a>`
      } else {
        str += data.title
      }

      str += `</strong></div>`
    }

    if (data.content) {
      str += `<div>${data.content}</div>`
    }

    if (data.imageUrl) {
      str += `<br><img src="${data.imageUrl}">`
    }

    if (data.footer) {
      str += '<h6>'

      if (data.footerIcon) {
        str += `<img src="${data.footerIcon}" height="14"> `
      }

      if (data.footerLink) {
        str += `<a href="${data.footerLink}">${data.footer}</a>`
      } else {
        str += data.footer
      }

      str += '</h6>'
    }

    str += '</blockquote>'

    return str
  }
}
