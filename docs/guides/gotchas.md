# Gotchas, limits and headless-vs-native differences

## Script loading

- `genesys.min.js` **must** come from the Genesys regional CDN. Self-hosting is "not supported and may result in unexpected behavior". So there is no npm package, no vendoring, and no bundling. (https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/genesysgf)
- **Don't hold on to the snippet's `Genesys` function.** `genesys.min.js` replaces `window.Genesys` with its own once it loads, and calls to the old one are queued forever. Call `window.Genesys(...)` afresh each time, or wrap it in a function that does (measured; see [loading-the-sdk.md](./loading-the-sdk.md#the-single-snippet)).
- **Inference, UNVERIFIED:** the file is served unpinned from a Genesys-controlled URL, so Subresource Integrity (SRI) hashes are impractical. Genesys can change behaviour under you. Pin your expectations with tests against live payloads, not against a copy of the script.
- Do not edit `deploymentId`/`environment` in the snippet. Keep them in config, but render them into the snippet verbatim.
- The docs' `debug: true` snippet example contains `| |` typos. Do not copy it literally.

## Deployment and configuration preconditions

| Symptom                                                              | Cause                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Source                                                                                                                                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Messenger.open` rejects "Messenger user interface must be enabled…" | Expected in headless mode. Do not call `Messenger.*` UI commands                                                                                                                                                                                                                                                                                                                                                                                                   | messengerPlugin                                                                                                                                                                           |
| `joinConversation` rejects "Auto start must be enabled…"             | autoStart is off. Use `startConversation`/`sendMessage`                                                                                                                                                                                                                                                                                                                                                                                                            | messagingServicePlugin                                                                                                                                                                    |
| "There is already an active conversation"                            | You called both `startConversation` and `configureConversation`                                                                                                                                                                                                                                                                                                                                                                                                    | messagingServicePlugin; [community answer by Genesys staff](https://community.genesys.com/discussion/messagingservicestartconversation-does-not-trigger-backend-post-in-headlessmodetrue) |
| `conversationDisconnected` never fires                               | **Conversation Disconnect** is off by default (_"Conversation disconnect is not enabled by default"_). Enable it (`Send` or `ReadOnly`) in the Messenger configuration                                                                                                                                                                                                                                                                                             | websocketapi#conversation-disconnect; matches the unresolved [community report](https://community.genesys.com/discussion/messagingserviceconversationdisconnected-not-triggering)         |
| `resetConversation` rejects                                          | Requires disconnect type **ReadOnly** and an already-disconnected conversation                                                                                                                                                                                                                                                                                                                                                                                     | messagingServicePlugin                                                                                                                                                                    |
| `clearConversation` rejects                                          | Requires **Clear Conversation** enabled in config                                                                                                                                                                                                                                                                                                                                                                                                                  | messagingServicePlugin                                                                                                                                                                    |
| `requestUpload` rejects "Sending attachments is disabled…"           | Attachments are off in config or the content profile                                                                                                                                                                                                                                                                                                                                                                                                               | messagingServicePlugin                                                                                                                                                                    |
| Nothing works on a domain                                            | Deployment **allowed domains** list excludes it. Messenger "rejects API requests from that domain". Remember `localhost` during development, and `127.0.0.1` too if you open the address `pnpm dev` prints. The SDK's client-side check matches on hostname only, so an entry of `localhost` covers any port (see [loading-the-sdk.md](./loading-the-sdk.md#where-the-config-comes-from)). **UNVERIFIED:** whether the server-side check treats ports the same way | https://help.genesys.cloud/articles/deploy-messenger/                                                                                                                                     |

## Session persistence, resume and multi-tab

- **Storage:** Messenger uses **localStorage**, not cookies. Each key is prefixed `_{deploymentId}:`. Examples: `gcmcsessionActive` (active conversation, up to 1 year), `actmu` (anonymous customer id, 1 year), `gcatkn`/`gcartkn` (auth tokens, ≤24 h). _"Messenger plugins never store Personally Identifiable Information (such as conversational data) in localStorage."_ Do not modify these keys. Use `Messenger.clear` instead. Genesys "reserves the right to change Messenger's storage structure without notice." (https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/localStorage)
- If the browser blocks localStorage, _"web messaging features will not function properly."_
- **Subdomains, conflicting docs.** The Developer Center localStorage page says data lives in the brand's origin and does **not** follow across subdomains. The Resource Center deprecation notice (effective 2025-01-27) says _"all Messenger-related localStorage will reside within the Genesys Cloud domain that serves Messenger"_, which means sessions persist across subdomains. The persistence FAQ adds: cross-subdomain persistence _"is not supported when the users of Messenger use Safari browser with default settings"_ and there is _"no current support for persisted sessions when moving across domains."_ **UNVERIFIED** which behaviour applies today. Test on your target browsers.
  - https://help.genesys.cloud/announcements/deprecation-configurable-session-persistence-methods-in-messenger/
  - https://help.genesys.cloud/faqs/what-is-messenger-session-persistence-and-how-does-it-work/
- **Resume on reload:** the SDK restores the session automatically and publishes `MessagingService.restored` with a **limited** set of recent messages. Call `fetchHistory` repeatedly until `historyComplete` to get older pages.
- **Session lifetime:** a Guest API session lives until 72 h after the last message by default (https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi#web-messaging-sessions). Admins can configure the guest session duration from 15 minutes to 18 months (default 3 days) (https://help.genesys.cloud/articles/configure-messenger/). The SDK surfaces this via `sessionDurationConfigured`, `sessionTimingUpdated` and `sessionWarning` (last 5 minutes). In headless mode, **you must render the expiry warning yourself**.
- **AutoStart trap:** after `configureConversation` without `joinConversation`, a reload restores the configured session instead of creating a new one. You must `clearConversation` and configure again.
- **Multi-tab / multi-device:** the Guest API allows **3** connections per session (`session.connections.max`). A 4th connection closes the oldest one with `ConnectionClosedEvent`. Messages fan out to all connections. **UNVERIFIED:** how the SDK maps tabs to connections, and how your UI is told when its tab's connection is closed (no SDK event is documented for `ConnectionClosedEvent`). `Messenger.clear` and `Auth.loggedOut` are documented to apply across tabs.
- `clearSession` vs `clearConversation`: `clearSession` closes the socket and clears the local transcript. `clearConversation` ends the conversation server-side, irreversibly, and forces agent wrap-up. A community question asked which to use for "read-only after end" and got no answer (https://community.genesys.com/discussion/best-way-to-end-a-conversation-with-headless-mode-sdk). For read-only-after-end, the documented mechanism is Conversation Disconnect = **ReadOnly** plus `resetConversation` to start fresh.

## CSP

Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/contentSecurityPolicy (per-region templates). US East (N. Virginia), CSPv3. The values are verbatim, reformatted to one line per directive:

```
Content-Security-Policy:
connect-src https://*.nr-data.net https://shyrka-prod.s3.amazonaws.com https://*.newrelic.com https://*.mypurecloud.com https://*.use1.pure.cloud wss://*.mypurecloud.com wss://*.use1.pure.cloud;
script-src 'unsafe-inline' https://*.nr-data.net https://*.newrelic.com https://*.mypurecloud.com https://*.use1.pure.cloud;
media-src https://*.mypurecloud.com https://*.use1.pure.cloud;
object-src https://*.mypurecloud.com https://*.use1.pure.cloud;
child-src https://*.mypurecloud.com https://*.use1.pure.cloud;
img-src https://*.mypurecloud.com https://*.use1.pure.cloud;
```

- `'unsafe-inline'` is in the template only because the snippet is inline. Prefer the documented nonce approach: `script-src 'nonce-{random}' 'strict-dynamic' https:;` with `<script nonce="...">` on the snippet.
- The templates are written for the native Messenger and are looser than a headless page needs. The sections below narrow them, based on reading the published scripts.

### Every region's template (accessed 2026-10-02)

The page renders client-side. Its markdown source can be read with a plain GET: `https://yeticms-api.genesys.cloud/api/gc-dev-center/publicassets/commdigital/digital/webmessaging/contentSecurityPolicy.md?content=true`. That URL was found in the Developer Center's own bundle (`getAssetContent`); it is undocumented. Every region's template has the same shape: `connect-src` = `*.nr-data.net`, `*.newrelic.com`, one S3 bucket, and `https://*.<domain>` / `wss://*.<domain>`. `script-src` = `'unsafe-inline'`, the two New Relic wildcards, and `https://*.<domain>`. `media-src`, `object-src`, `child-src` and `img-src` = `https://*.<domain>`. The CSPv3 header, CSPv2 header and meta-tag variants differ only in punctuation. The exception is that the meta tags omit `*.newrelic.com` from `connect-src` in some regions.

| Environment         | Domain(s) in the template                          | S3 bucket in `connect-src`                                                                  |
| :------------------ | :------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `prod`              | `mypurecloud.com`, `use1.pure.cloud`               | `shyrka-prod.s3.amazonaws.com`                                                              |
| `fedramp-use2-core` | `use2.us-gov-pure.cloud`                           | `shyrka-fedramp-use2-core.s3-fips.us-east-2.amazonaws.com`                                  |
| `prod-usw2`         | `usw2.pure.cloud`                                  | `shyrka-prod-usw2.s3.us-west-2.amazonaws.com`                                               |
| `prod-cac1`         | `cac1.pure.cloud`                                  | `shyrka-prod-cac1.s3.ca-central-1.amazonaws.com`                                            |
| `prod-euw1`         | `mypurecloud.ie`, `euw1.pure.cloud`                | `shyrka-prod-euw1.s3.eu-west-1.amazonaws.com`                                               |
| `prod-euw2`         | `euw2.pure.cloud`                                  | `shyrka-prod-euw2.s3.eu-west-2.amazonaws.com`                                               |
| `prod-euc1`         | `mypurecloud.de`, `euc1.pure.cloud`                | `shyrka-prod-euc1.s3.eu-central-1.amazonaws.com`                                            |
| `prod-euc2`         | `euc2.pure.cloud`                                  | `shyrka-prod-euc2.s3.eu-central-2.amazonaws.com`                                            |
| `prod-aps1`         | `aps1.pure.cloud`                                  | `shyrka-prod-aps1.s3.ap-south-1.amazonaws.com`                                              |
| `prod-apne1`        | `mypurecloud.jp`, `apne1.pure.cloud`               | `shyrka-prod-apne1.s3.ap-northeast-1.amazonaws.com`                                         |
| `prod-apne2`        | `apne2.pure.cloud`                                 | `shyrka-prod-apne2.s3.ap-northeast-2.amazonaws.com`                                         |
| `prod-apne3`        | `apne3.pure.cloud`                                 | `shyrka-prod-apne3.s3.ap-northeast-3.amazonaws.com`                                         |
| `prod-apse1`        | **not on the page**; SDK table: `apse1.pure.cloud` | **not on the page**; `shyrka-prod-apse1.s3.ap-southeast-1.amazonaws.com` exists (see below) |
| `prod-apse2`        | `mypurecloud.com.au`, `apse2.pure.cloud`           | `shyrka-prod-apse2.s3.ap-southeast-2.amazonaws.com`                                         |
| `prod-sae1`         | `sae1.pure.cloud`                                  | `shyrka-prod-sae1.s3.sa-east-1.amazonaws.com`                                               |
| `prod-mec1`         | `mec1.pure.cloud`                                  | `shyrka-prod-mec1.s3.me-central-1.amazonaws.com`                                            |
| `prod-mxc1`         | **not on the page**; SDK table: `mxc1.pure.cloud`  | **not on the page**; `shyrka-prod-mxc1.s3.mx-central-1.amazonaws.com` exists (see below)    |

- For Singapore and Mexico, the bucket names follow the pattern of the other regions. A plain GET on the bucket root answered `AccessDenied` (the bucket exists) for both, while a made-up name answered `NoSuchBucket` (measured 2026-10-02 with `curl https://<bucket>/`). **UNVERIFIED** that the SDK uploads to them.
- The Guest API page lists `wss://webmessaging.<domain>/v1` for every region, including `apse1` and `mxc1` (https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi, accessed 2026-10-02).

### What a headless page actually loads and connects to

Source: `genesys.min.js` 2.14.0 (identical bytes from `apps.mypurecloud.ie` and `apps.mypurecloud.com`, ETag `6a961f289576570c3c45c156a4bc0fd2`), `genesys-bootstrap/plugins/genesysvendors.min.js`, and the `messenger/*.html` pages, all read on 2026-10-02. `prod-mec1` serves an older build (2.10.23), which was not read. Search strings are exact text in those files.

- **Scripts on your page come from `https://apps.<domain>` only.** CXBus loads plugins by appending `<script src>` (search `document.createElement("script")`). Every URL is `serviceDiscovery.getUri(...)` = `https://apps.<publicDomainName>` plus a hard-coded path (`SERVICES` table: `/genesys-bootstrap/plugins/`, `/journey/messenger-plugins/journey.min.js`, `/journey/messenger-plugins/offersHelper.min.js`, `/cobrowse-next/sharer.min.js`, `/video-service/*.min.js`, `/support-center/...`). The deployment's `config.json` decides only _whether_ Journey, Cobrowse, Video, Auth and Support Center load (`init.journey.js`, `init.cobrowse.js`, and the rest test `.enabled`). It never decides _where_ they load from. `GenesysVendors` (axios and a WebSocket wrapper) loads on first use. `OffersHelper` loads unconditionally (`initOffers`). Two page-side globals can change the path: `window._webMessVersion` and the snippet's `debugConfigURL`. Both are yours, not the deployment's.
- **New Relic is not on your page.** The `NewRelic` plugin runs inside a hidden iframe, `https://apps.<domain>/messenger/thirdparty-plugins.html` (`ThirdPartyHelper`). That page sends its own CSP, which allows `https://js-agent.newrelic.com/` (response header, measured). Your policy does not govern it, so `*.nr-data.net` and `*.newrelic.com` are not needed on a headless page. This was read from source, not observed at runtime: **inferred**.
- **`MessagingService` runs in an iframe, but its network traffic runs on your page.** `MessengerHelper.open` injects two iframes: `{apps}/messenger/messenger.html` and `{apps}/messenger/messenger-renderer.html`. The plugin inside them asks the parent to do the I/O, with the commands `openWebSocket`, `makeRequest` and `uploadRequest`. The parent performs it with `GenesysVendors`. So your `connect-src` governs the WebSocket, the REST calls, and the file upload `PUT`, and your `frame-src` must allow `https://apps.<domain>`.
- **The parent's own guards on that traffic** (`genesysvendors.min.js`, search `WEBMESS-1813`):
  - A WebSocket is allowed only to an origin inside `config.json`'s `messenger.apps.conversations.messagingEndpoint`.
  - axios is allowed only to the `apiV2` origin (`https://api.<domain>`) or to an origin seen in a socket message's `body.url` (`setAPIOrigins` in `genesys.min.js`), which is how the presigned upload URL is admitted.
  - So the hosts are `wss://webmessaging.<domain>`, `https://api.<domain>`, and the upload host. Startup also does `XMLHttpRequest` GETs to `https://api-cdn.<domain>/webdeployments/v1/deployments/<id>/{domains,config}.json`, plus `/<lang>.json` for custom labels.
- **Upload host:** the presigned URL is redacted in the docs (`https://Presigned.URL`). The only S3 host in each region's template is the `shyrka-*` bucket, so that is presumably the upload `PUT` target. **UNVERIFIED**: not observed. A Genesys announcement (effective 2024-10-28) moved "content delivery" from S3 to CloudFront URLs without naming hosts (https://help.genesys.cloud/announcements/343819-2/, accessed 2026-10-02).
- **No `eval` is needed.** `new Function('return this')` appears only in webpack's `globalThis` fallback, which is never reached when `globalThis` exists. `get-intrinsic`'s `$Function(...)` in `genesysvendors.min.js` is lazy and wrapped in `try {} catch (e) {}`. No `Worker`, no `blob:` script, and no `createObjectURL` run on the parent page. **Inferred** from source.
- **Styles without `'unsafe-inline'`.** The parent-page iframe templates carry a `<style>` block. `stringToHTMLWithAdoptedStyles` moves it into `document.adoptedStyleSheets` before parsing, so that it "does not trigger a CSP style-src violation" (comment in the source). It falls back to `<style>` only where constructable stylesheets are missing. All other parent-page styling is CSSOM (`iframe.style[prop] = ...`), which `style-src` does not gate in browsers. One exception: `setupStorageClient` does `frame.setAttribute('style', 'display: none; border: 0;')`, which a strict `style-src` blocks. **UNVERIFIED** whether headless mode reaches it. If it does, the cost is a 0×0 iframe keeping its border, plus a violation report.

### Spec points for a strict policy

- **Import maps** are covered by `script-src`. HTML's "prepare the script element" runs the CSP inline check with type `"script"` for every `<script>` without `src`, before it branches on `importmap`. So a `'sha256-…'` of the element's exact text content allows it (https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element, accessed 2026-10-02).
- **A `<style>` in a shadow root** goes through the same check. "Update a style block" runs "Should element's inline behavior be blocked" on the element's child text content whenever the element is connected, and a shadow-root `<style>` is connected. So a hash of the exact `textContent` matches (https://html.spec.whatwg.org/multipage/semantics.html#update-a-style-block; CSP3 §6.1.13 `style-src`, https://w3c.github.io/webappsec-csp/, accessed 2026-10-02).
- **Constructable stylesheets** (`new CSSStyleSheet()`, `replaceSync`, `adoptedStyleSheets`) are not blocked by `style-src` in shipping browsers. CSP3 §6.1.13 _says_ CSSOM rule parsing should be gated on `'unsafe-eval'`, but it flags this as unfinished ("This needs to be better explained", w3c/webappsec-csp#212), and the initialization step reads "I don't think CSSOM gives us any hooks here". Genesys' production bundle relies on that gap. **Measured in Chrome** (2026-10-02): this repo's e2e suite runs the demo under the served policy, which has no hash for `chatStyles`, and the chat is fully styled with no CSP violation. **Inferred** for Firefox and Safari.

## Typing indicators

- Outgoing: `sendTyping` is throttled internally to one event per 5 s. Calling it on every `input` event is fine. Guest API guidance: send at most once every 5 seconds.
- Incoming: `typingReceived` carries `durationMs` (5000). Hide the indicator on `typingTimeout` **and on every `messagesReceived`**. When any message arrives, the SDK silently clears its typing timer and does **not** publish `typingTimeout`.
- Config flags `showAgentTypingIndicator` / `showUserTypingIndicator` exist, but the SDK does not enforce them: `sendTyping` has no flag check, and neither flag name appears in the published bundles. Honour them in your UI. **UNVERIFIED:** whether the server drops typing events when the flag is off. `sendTyping`'s callbacks never fire while it is throttled (5 s), so do not await it.
- Source for both points: `messagingservice.min.js` / `genesyscloud-messaging-transport.mod.js` 2.18.0, read 2026-10-01; see [sdk-source-notes.md](./sdk-source-notes.md#typing).
- Platform limit on agent-side typing events: 12 per conversation per minute.

## Read receipts / delivery status

- **Not documented for the web SDK.** No `MessagingService` receipt event exists. The Platform schema has `type: "Receipt"` with `status: Sent|Delivered|Read|Failed|Published|Removed`, but the Guest API and SDK pages show no receipts. The SDK bundles never mention `Receipt` (read 2026-10-01, [sdk-source-notes.md](./sdk-source-notes.md#what-is-filtered-and-what-is-not)), so a receipt body would pass through `messagesReceived` unfiltered. **UNVERIFIED** whether the Guest API sends them to web guests.
- What _is_ documented is local send state. Use `sendingMessage` (with a `tracingId`) to show "sending", and match the echo in `messagesReceived` to show "sent". A rejected `sendMessage` means "failed".

## Rate limits and size limits

Source: https://developer.genesys.cloud/organization/organization/limits (Web Messaging section)

| Limit key                                                                    | Value |
| ---------------------------------------------------------------------------- | ----- |
| `messages.per.session.rate.per.second`                                       | 5     |
| `requests.per.connection.rate.per.minute` (all WebSocket requests)           | 60    |
| `configure.per.session.rate.per.minute`                                      | 60    |
| `connections.rate.per.minute` (per deployment)                               | 1000  |
| `get.history.rate.per.minute` (per session)                                  | 10    |
| `health.check.per.connection.rate.per.minute`                                | 2     |
| `session.connections.max`                                                    | 3     |
| `metadata.custom.attributes.bytes.max`                                       | 2048  |
| `history.retention.ephemeral.contact.days.max`                               | 15    |
| `outbound.webmessaging.and.open.messaging.characters.max` (agent → customer) | 4000  |

- Inbound text limit: error `4011` "Message length 5000 is larger than 4096". Keep messages ≤ 4096 bytes (bytes, not characters). Enforce this in the input.
- 429 errors use class `TooManyRequestsErrorMessage` with `retryAfter` in seconds.
- `fetchHistory` is subject to 10 per minute per session. Debounce your "load older" scroll trigger.

## Attachments

Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi#inbound-message-with-a-attached-file and the MessagingService page.

- One file per `requestUpload`. Max **10 MB**. _"Extensions are required on all file attachments."_ File names must be under 1024 chars. Empty files are rejected (4102).
- Allowed types come from the **Supported Content Profile**. If the config has `fileUpload.enableAttachments`, read types from the `MessagingService.allowedFileTypes` event and **ignore** `fileUpload.modes`. Otherwise (older deployments), read `fileUpload.modes`. (https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK#reading-the-allowed-file-types-from-your-deployment)
- The server also blocks a list of executable extensions (`.exe`, `.js`, `.bat`, `.ps1`, ...) regardless of profile. See `blockedExtensions` in the Guest API `getConfiguration` response.
- Download URLs are signed and expire (error 4008 "Attachment has expired"). Refresh them with `getFile`/`refreshFiles` before showing old images.
- An upload is staged until the next `sendMessage`. Use `deleteFile` to discard it.

## Other differences between headless and native

- No built-in UI for: transcript, launcher, typing bubbles, quick-reply chips, card rendering, the session-expiry AlertBar, the co-browse toolbar, or the Predictive Engagement invite. You build all of them.
- Markdown rendering, link handling and HTML escaping are now your responsibility. Treat all `text` as untrusted.
- Localization: the config exposes `languages`, `defaultLanguage` and `customI18nLabels`. The SDK does not localize your UI strings.
- Accessibility (focus management, live regions for new messages) is entirely on you.

## Documentation inconsistencies spotted (as of 2026-10-01)

- Headless page example subscribes to `"MessengerService.cobrowseOffer"`. The event is documented as `MessagingService.cobrowseOffer`.
- `sessionTimingUpdated` / `sessionWarning` examples read fields off the callback argument directly. All other events use `({ data })`.
- The `datePicker` `sendMessage` example is missing a comma before the callbacks.
- `Conversations.error` example references an undefined `o`.
- The `MessagingService.sendMessage` resolution table links the datePicker/listPicker/form row to a non-existent `#messagingservice-scheduled` anchor.
