# Genesys Cloud Web Messaging: a headless chat reference

A complete custom chat UI for Genesys Cloud Web Messaging, built on the Messenger JavaScript SDK
in **headless mode**. Genesys loads its SDK, and every pixel of the chat is our own: plain Web
Components, no framework and no runtime dependencies. It looks and behaves like Genesys' own
Messenger. That covers the launcher in the corner, the panel, the colours and icons, and the
wording, all taken from the deployment's own settings.

**Try it:** <https://safricloud-pty-ltd.github.io/genesys-cloud-headless-webmessage-reference/?demo>

This repository is the built page and the research behind it. It holds `index.html`, the compiled
ES modules in `dist/` and the guides in `docs/guides/`. The modules are not minified and keep
their documentation comments, so you can read them as they are. The browser resolves them with
the import map in `index.html`, with no bundler.

## What it covers

- **The native look:** the round launcher, the floating panel (full screen on phones), the home
  screen, agent avatars and names, and native's icons and English labels. Colour, side, spacing,
  launcher visibility and home-screen text all come from the deployment's Messenger
  configuration.
- **Conversations:** start with the first message (or on opening, with autoStart), restore after
  a reload with the panel reopened, and page through earlier history.
- **Messages:** text with the rich text Genesys Messenger renders (`*bold*`, `_italic_`,
  `~strike~`, `==highlight==`, code, links, bare URLs), "sending" until the echo arrives, and
  typing indicators both ways.
- **Structured content:** quick replies, cards and carousels, date pickers, list pickers, and
  multi-page forms with a summary step.
- **Attachments:** send a file with upload progress, checked against the deployment's allowed
  types first. Received images and files are shown, and expired links are refreshed.
- **Conversation end:** a disconnect in Send or ReadOnly mode, "Start new", clearing the
  conversation, and the session-expiry warning.
- **Connection and errors:** offline and reconnecting status, and readable error notices.
- **Accessibility:** a polite live-region transcript, full keyboard use, and labelled controls
  (WCAG 2.2 AA is the target).

Authenticated messaging, co-browse and Predictive Engagement are not covered.

## Use it with your own deployment

1. In Genesys Cloud Admin, under Message → Messenger Configurations, turn the **User
   Interface** toggle off. That is headless mode. Create a Messenger Deployment that uses the
   configuration and an inbound message flow. The details are in
   [`docs/guides/headless-mode-overview.md`](docs/guides/headless-mode-overview.md).
2. Add the host that serves the page to the deployment's **allowed domains**. For the copy
   above, that is `safricloud-pty-ltd.github.io`.
3. Open the page with your deployment id and region:

   ```text
   https://safricloud-pty-ltd.github.io/genesys-cloud-headless-webmessage-reference/?deploymentId=<your deployment id>&environment=<region>
   ```

   For example `environment=prod-euw1`. The region values are listed in
   [`docs/guides/loading-the-sdk.md`](docs/guides/loading-the-sdk.md). Add `&markdown=off` if
   your Messenger configuration has Rich Text Formatting turned off, because headless mode can't
   read that flag.

With `?demo` instead, the whole UI runs against a scripted bot on an in-memory fake of the SDK,
with no Genesys org. Type `card`, `carousel`, `date`, `list`, `form`, `markdown`, `file` or
`bye` to see each kind of content.

The page takes its configuration from the URL, so no deployment id lives in the files. It also
means anyone can open the page with any deployment. See **Anyone can point the page at any
deployment** below.

## Look and feel

The launcher and panel follow the deployment's Messenger configuration, as native Messenger
does: primary colour, alignment and spacing, launcher visibility and its icon or text, the home
screen and logo, the custom labels, and humanize (agent avatars and names). Headless mode's
documented `GenesysJS.configuration` strips every one of these, so the page reads them from the
undocumented `GenesysJS.configurationReceived` event. If that event ever stops arriving, the chat
falls back to Genesys' defaults.

`<chat-window>` sets the theme as inline custom properties: `--chat-primary`,
`--chat-on-primary`, `--chat-side-space` and `--chat-bottom-space`. A host page that wants other
values overrides them on `chat-window` with `!important`, because inline styles win otherwise.
With the launcher set to Hide (Genesys' advice for a custom UI), give the page a button with the
`data-chat-open` attribute, or open the panel from your own code with
`document.querySelector('chat-window').open()`.

## Where to look

| You want…                                     | Look at                                               |
| --------------------------------------------- | ----------------------------------------------------- |
| To load the SDK without pasting the snippet   | `dist/messenger/shell/genesys/installGenesys.js`      |
| A promise wrapper for `Genesys('command', …)` | `dist/messenger/shell/genesys/runCommand.js`          |
| To parse what the SDK publishes               | `dist/messenger/shell/genesys/parse/`                 |
| A fake SDK for your own tests                 | `dist/messenger/shell/genesys/fake.js`                |
| The conversation state machine                | `dist/chat/core/conversation/`                        |
| Markdown without `innerHTML`                  | `dist/chat/core/richText/` + `dist/chat/ui/richText/` |
| Picker and form answers in Genesys' format    | `dist/chat/core/answers/`                             |

The flow is one loop:

1. **SDK events are parsed once.** `makeMessenger` subscribes to every `MessagingService` event
   the page uses and turns each payload into a typed event. The SDK publishes messages in two
   different shapes, and both become one message model.
2. **The window reduces them.** `<chat-window>` feeds each event through `reduceConversation`, a
   pure function, and redraws only the rows that changed.
3. **Customer actions go out as intents.** Every click and keypress leaves the window as a
   `chat-intent` DOM event. `runIntent` turns each intent into one SDK command and feeds the
   outcome back as an event.

## What the Genesys docs don't tell you

The details, sources and the payloads observed in a live session are in
[`docs/guides/`](docs/guides/README.md).

- **`genesys.min.js` replaces `window.Genesys` when it loads.** If you keep a reference to the
  snippet's function, your commands queue up forever. Look it up on every call.
- **Messages arrive in two shapes.** `messagesReceived` carries raw Guest API bodies, while
  `restored` and `oldMessages` carry the SDK's own formatted shape. The two even disagree on a
  message's id.
- **History arrives newest-first and can repeat** after every reconnect.
- **There is no unsubscribe.** And `started` and `restored` replay their last payload to late
  subscribers.
- **Some command callbacks never fire**, `sendTyping` while throttled among them.
- **The SDK doesn't hide the agent typing indicator** when a message arrives, and it ignores
  `showUserTypingIndicator`.
- **Session expiry timestamps are in seconds**, not milliseconds.
- **Headless mode hides the deployment's look and feel.** `GenesysJS.configuration` strips
  colour, position, launcher and home-screen settings. `GenesysJS.configurationReceived` still
  carries them, and replays to late subscribers.

## Hosting it yourself

The page is static. Copy `index.html` and `dist/` to any static host. Nothing runs on the
server.

**Give it its own origin.** Serve it from its own host name, such as `chat.example.com`, not
from a path on a site that runs other applications. `genesys.min.js` runs as first-party script
on whatever origin serves the page. On a shared origin it could read the other applications'
non-`HttpOnly` cookies and `localStorage`. A subdomain still receives cookies set for its parent
domain, so check how your other applications scope their cookies.

**Send the security headers if your host can.** `index.html` declares its Content-Security-Policy
and referrer policy in `<meta>` tags, so they apply on any host. The policy allows this site, the
import map by its hash, and the Genesys hosts of every region, and nothing else. A host that can
send response headers should also send:

```text
Content-Security-Policy: <the policy from the meta tag>; frame-ancestors 'none'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

A policy in a `<meta>` tag can't forbid framing, and no page can set the other headers for itself.
GitHub Pages sends none of them, so the copy above can be framed by another site. If you edit
the inline import map or `<style>` in `index.html`, their hashes in the policy change. Recompute
them as `'sha256-<base64 of the SHA-256 of the exact text between the tags>'`.

**Anyone can point the page at any deployment.** Someone could open your copy with their own
`deploymentId` and send the link around. They can't run script on your page: every message, card
and form is rendered as text, links are limited to `https:`, `http:` and `mailto:`, and the SDK
loads only from the Genesys host for the region. They can show their own words under your domain
name, though. If that matters for your domain, host the page on a domain that carries no trust of
its own, or edit `dist/app/readConfig.js` so your copy uses one fixed deployment.

In your Messenger Deployment, set **allowed domains** to the host that serves the page. That
stops other sites from using _your_ deployment.

## Licence

MIT; see [`LICENSE`](LICENSE). The page draws a few Material icons as inline SVG, under MIT and
Apache-2.0; see [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
