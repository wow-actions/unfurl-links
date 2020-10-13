# Unfurl Links

A Github Action to unfurl links on Issues and Pull Request discussions.

![screenshot](https://github.com/bubkoo/unfurl-links/blob/master/screenshots/default.jpg?raw=true)

## Usage

Create `.github/workflows/unfurl-links.yml` in the default branch:

```yml
name: Unfurl Links
on:
  issues:
    types: [opened, edited]
  issue_comment:
    types: [created, edited]
  pull_request:
    types: [opened, edited]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: bubkoo/unfurl-links@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

#### GITHUB_TOKEN

Your GitHub token for authentication.

#### raw

Specify if only render the raw links. Default `true`.

![raw links](https://github.com/bubkoo/unfurl-links/blob/master/screenshots/raw-links.jpg?raw=true)

Set `raw` to `false` to render all links.

```yml
name: Unfurl Links
on:
  issue_comment:
    types: [created]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: bubkoo/unfurl-links@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          raw: false
```

![all links](https://github.com/bubkoo/unfurl-links/blob/master/screenshots/all-links.jpg?raw=true)

#### header

Cutsom header of the unfurled card. `header` can be a [Handlebars](https://handlebarsjs.com/) template and rendered with parsed metadata.

```yml
name: Unfurl Links
on:
  issue_comment:
    types: [created]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: bubkoo/unfurl-links@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          header: '<i><a href="{{ url }}">{{ url }}</a></i>'
```

![custom header](https://github.com/bubkoo/unfurl-links/blob/master/screenshots/custom-header.jpg?raw=true)

#### template

[Handlebars](https://handlebarsjs.com/) template to render the unfurled card. The template will be rendered with parsed metadata from url.

```ts
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
```

And the default template is:

```hbs
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
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
