import * as core from '@actions/core'
import * as github from '@actions/github'

export namespace Util {
  export function getOctokit() {
    const token = core.getInput('GITHUB_TOKEN', { required: true })
    return github.getOctokit(token)
  }

  export function isValidEvent(event: string, action?: string) {
    const context = github.context
    const payload = context.payload
    if (event === context.eventName) {
      return action == null || action === payload.action
    }
    return false
  }

  export function getHtml(data: any) {
    const body = data.body as string
    const html = data.body_html as string

    return body.match(/<([a-z]+)>(.*)<\/\1>/g) ? body : html
  }
}
