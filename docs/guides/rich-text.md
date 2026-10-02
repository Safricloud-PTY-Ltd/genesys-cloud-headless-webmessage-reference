# Rich text (markdown) in message text

This guide covers what the native Messenger UI does to a message's `text` before showing it, so a headless UI can match it. All of it was read and measured on **2026-10-01**. The scripts are not a contract and can change without notice.

## Sources (accessed 2026-10-01)

- Resource Center, _Markdown syntax for rich text in Messenger_: https://help.genesys.cloud/articles/markdown-syntax-for-rich-text-in-messenger/
- Resource Center, _Use the rich text toolbar to format text in a message interaction_ (agent side): https://help.genesys.cloud/articles/use-the-rich-text-toolbar-to-format-text-in-a-message-interaction/
- Resource Center, _Configure Messenger_ ("Rich Text Formatting" toggle): https://help.genesys.cloud/articles/configure-messenger/
- `https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js` (`genesys.js` 2.14.0). The file is not minified. Webpack module 124 bundles `marked` v4.3.0 (`./node_modules/marked/lib/marked.esm.js`), `turndown`, and Genesys' wrapper `./includes/markdown.js`. Module 353 is `./plugins/plugin.markdown.js`.
- `https://apps.mypurecloud.ie/messenger/messenger.min.js` (the native UI) and `messengerrenderer.min.js` / `main.min.js` (DOMPurify 3.3.3, and the `an` sanitize helper in module 95123).
- Measurements: lines 24 to 4277 of `genesys.min.js` were loaded into Node 24, and `configureMarkdown` / `getMarkdown` were called directly. The outputs below are copied from those runs.

The Developer Center does not document the `Markdown` plugin. Its commands are known only from the script.

## The docs' syntax list

According to the Resource Center article (summarised, not verbatim):

| Format        | Syntax          | Note                                                      |
| ------------- | --------------- | --------------------------------------------------------- |
| Bold          | `*text*`        | Single asterisk, not `**`                                 |
| Italics       | `_text_`        |                                                           |
| Strikethrough | `~text~`        | Single tilde, not `~~`                                    |
| Hyperlink     | `[text](url)`   |                                                           |
| Highlighted   | `==text==`      | "only supported in outbound messages"                     |
| Monospace     | `` `text` ``    |                                                           |
| Code block    | ` ```text``` `  | "should not include spaces between backticks"             |
| Escaping      | `\*bold text\*` | A backslash before a special character shows it literally |

The article presents this as formatting for bot messages (Bot Connector, Dialog Engine Bot Flows, canned responses, web messaging), and it requires "Rich Text Formatting" to be enabled. The code matches this list exactly and adds bare-URL and email autolinking.

## How the native UI renders text

1. Every transcript message that has both `text` and `messageType` goes through `Genesys("command", "Markdown.getMarkdown", { text, messageType })` (`awaitMarkdown` in `messenger.min.js`). The result's `markedText`, an HTML string, replaces `text`. Inbound (customer) and outbound (agent and bot) messages both take this path.
2. That HTML is passed through `DOMPurify.sanitize(html, { ADD_ATTR: ["target"] })` (the helper `an` in module 95123). No DOMPurify hooks are registered.
3. The result is injected with `dangerouslySetInnerHTML` into an element with class `mxg-markdown` and `dir="auto"`. Image, video and attachment captions go through the same `an()` path.
4. The bubble (`.mxg-message-bubble`) has `white-space: pre-wrap`. A plain `\n` therefore shows as a line break, even though no `<br>` is produced.

`getMarkdown` calls `marked.parseInline(text)`. It is inline-only: no block parsing and no paragraphs.

### What `Markdown.configure` leaves on

`configureMarkdown` (`includes/markdown.js`) disables every built-in marked rule except `escape`, `link` (only when enabled), the GFM bare-URL `url` rule, and `text`. Disabled inline rules: `heading, autolink, blockSkip, br, code, del, nolink, overlapSkip, punctuation, reflink, reflinkSearch, tag`, plus `emStrong`. All block rules are disabled too. Six custom extensions are then registered (only when `enabled`):

| Extension       | Delimiter   | Output        | Rule (from source)                                                                                                                                                                                                         |
| --------------- | ----------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `boldText`      | `*…*`       | `<strong>`    | Must start with exactly one `*`. Closes at the next `*` that is not preceded by `\`. **No flanking rule:** `5 * 3 * 2` becomes `5 <strong> 3 </strong> 2`, and `a*b*c` bolds `b`. Can span newlines.                       |
| `italicText`    | `_…_`       | `<em>`        | Exactly one `_`, and no whitespace just inside it. The character before the opening `_` and the one after the closing `_` must not be a Unicode letter or digit, so `snake_case` and emails stay intact. Single line only. |
| `strikethrough` | `~…~`       | `<s>`         | Same scanning as bold.                                                                                                                                                                                                     |
| `highLight`     | `==…==`     | `<mark>`      | Skipped when `messageType` is `inbound` and `highlight.allowInbound` is `false`. The launcher sets it to `false`.                                                                                                          |
| `monospace`     | `` `…` ``   | `<code>`      | Exactly one backtick each side. One leading and one trailing space are trimmed if both are present. **The content is still parsed**: `` `*b*` `` gives `<code><strong>b</strong></code>`.                                  |
| `codeBlock`     | ` ```…``` ` | `<pre><code>` | An inline extension, so it can sit mid-line. Newlines inside are kept. The content is still parsed, as with monospace.                                                                                                     |

Also active:

- **Links** `[text](url)` and `[text](url "title")` produce `<a target='_blank' href="url" title="title">text</a>`. The link text is parsed for the extensions above. No `rel` is added anywhere. marked runs with `sanitize: false`, so it does not filter schemes. DOMPurify's default `ALLOWED_URI_REGEXP` does that afterwards: `/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i`. By DOMPurify's documented behaviour an `href` such as `javascript:` is removed and the `<a>` text kept (not run here). The plugin's `disableLinkFocus` option adds `tabindex='-1'`. `isLinkIncluded` in the result only drives focus management.
- **Bare URLs and emails** (the GFM `url` rule): `https://…`, `http://…`, `www.…` (the href becomes `http://www.…`) and `name@host.tld` (a `mailto:`, entity-obfuscated by marked's `mangle`) are linked. Genesys overrides `_backpedal` so a URL may end in `_` (WEBMESS-773).
- **Backslash escapes** (marked's `escape` rule, ASCII punctuation): `\*`, `\_`, `\~`, `` \` ``, `\=` and so on print the literal character.
- **Everything else is literal text, HTML-escaped by marked**: `**x**` gives `*<strong>x</strong>*`, `~~x~~` gives `~<s>x</s>~`, and `__x__` gives `_<em>x</em>_`. Headings, blockquotes, lists, tables and `<https://x>` angle autolinks are not parsed; the last produces a broken link to `https://x%3E`. Raw HTML such as `<b>` is shown as text. Images `![alt](src)` are re-emitted as their literal source (WEBMESS-931). A hard break (two trailing spaces) gives no `<br>`.

## The `markdown.enabled` flag

Yes, the flag gates rendering. The native UI reads `messenger.apps.conversations.markdown.enabled` from the deployment config (`main.min.js`: `{markdown:A}=v, {enabled:S}=A`, then `Genesys("command","Markdown.configure",{enabled:S,highlight:{allowInbound:!1}})`). The transcript also calls `Markdown.configure({ disableLinkFocus: false, enabled })` on each message render, with `enabled` taken from the same flag (`messenger.min.js`, `{markdown:re}=…conversations`, `{enabled:pe}=re`).

With the flag **off**, messages still go through `getMarkdown`, but none of the six extensions are registered and `[text](url)` is not parsed. The result is plain HTML-escaped text in which bare URLs and emails are still linked and backslash escapes still apply. Measured: `[t](https://a.com)` gives `[t](<a target='_blank' href="https://a.com">https://a.com</a>)`, and `*b*` stays `*b*`.

A headless UI cannot read this flag through `Genesys("command", "GenesysJS.configuration")`, which returns a trimmed copy of the configuration; see [loading-the-sdk.md](./loading-the-sdk.md).

## Agent, bot and customer text

The renderer is source-agnostic. `getMarkdown` receives only `text` and `messageType`, and the only difference it makes is that `==highlight==` is suppressed on `inbound`. Agent, bot and customer text are otherwise rendered identically, so a customer typing `*hi*` sees it bold in their own bubble.

Differences are on the authoring side only. Agents on web messaging get a toolbar (Bold, Italic, Strikethrough, Monospace, Highlight, Code, Link) or can type the syntax, but cannot mix the two (toolbar article). **UNVERIFIED:** the exact markdown the agent toolbar emits; it is assumed to be the syntax above. Bots (Architect, Bot Connector, Dialog Engine) send the syntax as typed.

## Where this reference differs

The reference follows the documented syntax, not two quirks of the native renderer:

- **Code is literal.** The native UI parses markdown inside code spans and blocks; the reference shows code exactly as typed.
- **`*` and `~` need non-space just inside the delimiter.** The native UI bolds `5 * 3 * 2`; the reference leaves it literal, so arithmetic and lists of asterisks read as written.

## The `Markdown` plugin in headless mode

`genesys.min.js` registers the plugin unconditionally with `Genesys('registerPlugin', 'Markdown', ...)`. Its commands are `configure` (`{ enabled: boolean, highlight?: { allowInbound }, disableLinkFocus? }`, and it rejects without a boolean `enabled`), `parse` (`{ text }`, resolves an HTML string), `getMarkdown` (`{ text, messageType? }`, resolves `{ markedText, isLinkIncluded }`), and `extend` (`{ extensions }`, extra marked extensions).

In headless mode nothing calls `configure`. **Until something does, marked's defaults apply, and raw HTML passes through unescaped.** Measured: `<b>raw</b> **bold**` gives `<b>raw</b> <strong>bold</strong>`. The plugin is also undocumented and returns an HTML string. A UI that renders without `innerHTML` should therefore implement the rules above itself rather than call the plugin.
