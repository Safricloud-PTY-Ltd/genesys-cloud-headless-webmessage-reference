# What the published SDK source does (MessagingService internals)

The Developer Center leaves several `MessagingService` behaviours undocumented. This guide settles them by reading the scripts Genesys publishes. Everything here was read on **2026-10-01** from the EU (Ireland) CDN. Genesys can change these files at any time, and they are not a contract, so treat this as "how it behaves today". The [loading-the-sdk.md](./loading-the-sdk.md), [messaging-service.md](./messaging-service.md) and [gotchas.md](./gotchas.md) guides link here wherever they rely on it.

## Which files

| File                                                                                                                         | Version / Last-Modified         | What it contains                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js`                                                               | `genesys.js` 2.14.0, 2026-09-07 | The bootstrap. Embeds **CXBus**, the event bus behind `Genesys("command" / "subscribe" / "registerPlugin", ...)`                               |
| `https://apps.mypurecloud.ie/messenger/messenger-renderer.html`                                                              | 2026-09-08                      | The Messenger iframe page. Its `pluginmap` maps `"MessagingService": "./messagingservice.min.js"`                                              |
| `https://apps.mypurecloud.ie/messenger/messagingservice.min.js`                                                              | `messenger` 2.18.0, 2026-09-08  | The `MessagingService` plugin: commands, and every `MessagingService.*` publish                                                                |
| `https://apps.mypurecloud.ie/messenger/genesyscloud-messaging-transport.mod.js`                                              | `messenger` 2.18.0, 2026-09-08  | The transport the plugin loads with `Genesys("loadModule", "genesyscloud-messaging-transport")`: WebSocket frames, history, message formatting |
| `https://apps.mypurecloud.ie/messenger/messagingMiddleware.min.js`, `https://apps.mypurecloud.ie/messenger/messenger.min.js` | 2026-09-08                      | The native UI's middleware and reducers. Not used in headless mode, but they show how Genesys' own UI consumes the events                      |

How they were found: `genesys.min.js` points `MessengerHelper` at `{apps}/messenger/messenger.html` and `{apps}/messenger/messenger-renderer.html` (search `messenger-renderer.html`), and maps the module `genesyscloud-messaging-transport` to `/messenger/genesyscloud-messaging-transport.mod.js` (search `messagingTransport`). The `genesys.min.js` `MessengerHelper.open` command has no headless branch (search `registerCommand('open'`). `initMessenger` calls it whenever `messenger.enabled` is true. So headless mode also injects `#genesys-mxg-frame` (title "Messenger Launcher", `messenger.html`) and `#genesys-mxg-container-frame` (`messenger-renderer.html`): `position: fixed`, 0×0, `inert`, z-index 99999999. `MessagingService` runs inside the second (re-read 2026-10-02). In headless mode nothing ever resizes them; see [other-plugins.md](./other-plugins.md#launcher-and-messenger-ui-plugins-mostly-na-in-headless-mode). Events reach page subscribers over CXBus `postMessage` bridging, which does not change their shape (see below).

The plugin and transport are minified. Search strings below are exact text in the minified files, so you can find them with your browser's devtools.

## Subscribing: the callback always gets an envelope

CXBus builds one envelope for every publish (in the embedded CXBus in `genesys.min.js`, the function that logs `" published: "`):

```js
// genesys.min.js, embedded CXBus, formatted
f = { time: Xe(), publisher: e, event: u, eventName: t, data: n || {} };
```

- Live publishes reach a subscriber as `{ time, publisher, event, eventName, data }`. `event` is the full name (`"MessagingService.sessionWarning"`), `eventName` the short one, and `data` the payload (`{}` when the plugin passed none).
- Replays to late subscribers (see "republish" below) arrive as `{ time, publisher, event, data }`, **without `eventName`**. Read `event` or `data`, never `eventName`.
- `sessionWarning` and `sessionTimingUpdated` are no exception. The plugin publishes them like every other event, so the payload is under `.data`:

```js
// messagingservice.min.js, formatted
e.publish('sessionTimingUpdated', { durationSeconds: Number(t), expirationDate: Number(n) });
e.publish('sessionWarning', { expirationTime: Number(t) });
```

The two Developer Center examples that destructure `{ expirationTime }` directly from the callback argument are wrong. Use `({ data }) => data.expirationTime`.

- Callbacks run asynchronously by default. CXBus' `async` option defaults to `true` and `genesys.min.js` does not override it, so each callback is invoked from `setTimeout(..., 0)`.

## Subscribing: there is no global unsubscribe

- `Genesys("subscribe", name, cb)` returns `undefined`. The global dispatcher calls the internal subscribe and discards its return value. There is no `"unsubscribe"` case in the global dispatcher (its cases are `registerPlugin`, `command`, `subscribe`, `monitor`, `registerChild`, `registerModule`, `executeQueue`, `loadPlugin`, `loadFile`, `loadModule`, `loadJSON`, `configure`).
- A **registered plugin object** does have one: `P.unsubscribe(eventName)`. It removes **every** callback that this plugin namespace registered for that event (it filters by subscriber name, not by callback) and returns `true`/`false`. `P.subscribe(eventName, cb)` returns the event name, or `false`.
- `registerPlugin` with a name that is already registered fails with `Can't register plugin <name> -- Name is already taken`.

So the choices are: subscribe once globally and route events through your own dispatcher (callbacks can never be removed), or register a uniquely named plugin per subscriber and call its `unsubscribe` per event.

## `ready`, `started`, `restored`: ordering and replay

CXBus has two kinds of publish. `publish` delivers to current subscribers only. `republish` also stores the payload, and every later `subscribe` to that event gets the stored payload replayed immediately. The stored value is the **last** one, and it is never cleared.

| Event                            | Kind                                           |
| -------------------------------- | ---------------------------------------------- |
| `MessagingService.ready`         | republish (every plugin's `ready()` does this) |
| `MessagingService.started`       | republish (`e.republish("started", o)`)        |
| `MessagingService.restoring`     | republish                                      |
| `MessagingService.restored`      | republish (`e.republish("restored", s)`)       |
| every other `MessagingService.*` | publish (no replay)                            |

Ordering: the plugin calls `e.ready()` synchronously as the last statement of its registration callback. Before that it only queues asynchronous work: a storage read whose `.then` runs `e.command("init")`, and `init` runs `restore` from a `setTimeout(..., 200)`. `started` needs a WebSocket session response. So in this version `ready` is always published before `restoring`, `restored` and `started`.

Consequences:

- Subscribing late to `ready` is safe, as the docs say.
- Subscribing late to `started` or `restored` **also** gets a replay, of the last payload. A component that subscribes when it mounts will receive a stale `restored` snapshot or `started` from earlier in the page's life, even after `sessionCleared`/`conversationCleared`. Treat these as "current snapshot" events and make handlers idempotent.

## Message objects: two shapes

`messagesReceived` and `restored`/`oldMessages` do **not** carry the same message shape.

### `messagesReceived`: the raw Guest API body, plus `tracingId`

The transport takes the WebSocket frame `{ code, body, class, type, tracingId }`, copies the frame's `tracingId` onto the body, and publishes that:

```js
// genesyscloud-messaging-transport.mod.js, formatted
let W = h || p; // h = frame.message, p = frame.body
b && (W = Te(Te({}, W), {}, { tracingId: b })); // b = frame.tracingId
// ...later, per new message:
s.onMessageReceived({
  messages: e /* formatted */,
  originalMessages: [s.oMessages[v]] /* raw W */,
});
// messagingservice.min.js
e.publish('messagesReceived', { messages: t.originalMessages });
```

- `data.messages` is always a **one-element array** holding the raw Guest API message body (`id`, `direction`, `type`, `text`, `content`, `events`, `channel`, `metadata`, `originatingEntity`) with an added top-level **`tracingId`**. The path is `data.messages[0].tracingId`.
- For your own echoed inbound message, `tracingId` is the one the SDK generated when it sent the frame, which is the same value as `sendingMessage`'s `data.message.tracingId`. Genesys' own UI relies on this: its reducer finds the pending message with `e.tracingId === n` and replaces it with the received one, marked `deliveryStatus: "sent"` (`messenger.min.js`, search `deliveryStatus:"sent"`).
- The SDK adds two more fields in one case: when an inbound reply to a date picker, list picker or form arrives, it sets `state: "consumed"` and `updatedTime` (ISO string) on that message object before publishing it.
- De-duplication: the transport keeps a map of messages it has seen, keyed by **`channel.time`** (falling back to `id`), and publishes a message only if its key is new. Two different messages with an identical `channel.time` would be collapsed.

### `restored` and `oldMessages`: the SDK's formatted shape

History goes through `formatMessages`, which returns `ke.formattedMessage(t)` for each entity, not the entity:

```js
// genesyscloud-messaging-transport.mod.js, formatted (formattedMessage)
f = {
  from: g || '',
  text: t,
  type: n.toLowerCase(),
  id: o.messageId || i,
  time: o.time,
  timestamp: o.time,
  files: [],
  quickReplies: [],
  card: {},
  carousel: { cards: [] },
  datePicker: {},
  coBrowse: {},
  video: {},
  messageType: s.toLowerCase(),
  originatingEntity: c || '',
  tracingId: h || '',
};
```

- `type` and `messageType` are **lower-case** (`"text"`, `"structured"`, `"event"`; `"inbound"`, `"outbound"`), or `""` when the raw field is missing. There is no `direction`, `channel`, `content`, `events` or `metadata`.
- `from` is the raw `channel.from` object (with `name` and `avatar` copied from `nickname`/`image` when present), or `""`.
- `tracingId` is `""` unless the history entity carries one.
- `messagesUpdated.updatedMessages` uses this formatted shape too.

#### The formatted shape, field by field

Read from `formattedMessage` in `genesyscloud-messaging-transport.mod.js` 2.18.0 (2026-10-01). It walks every `content[]` item and every `events[]` item of the raw entity and fills these fields:

| Raw input                                                                                                         | Formatted output                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `channel.messageId`, else `id`                                                                                    | `id`                                                                                                                                                                                                                                                       |
| `channel.time`                                                                                                    | `time` **and** `timestamp`, both the ISO string, or `""`                                                                                                                                                                                                   |
| `text`                                                                                                            | `text`, unchanged (can be `undefined`)                                                                                                                                                                                                                     |
| `Attachment` `{ id, mediaType, mime, url, filename \| fileName, fileSize }`                                       | **appends** `files[]` item `{ downloadUrl: url, size: fileSize, name: fileName \|\| filename, type: mediaType, mime, id }`. Sets **no** `contentType`                                                                                                      |
| `QuickReply` `{ id?, text, payload, image, action }`                                                              | **appends** `quickReplies[]` item `{ id: id \|\| <generated>, text, payload, imageUrl: image, action }`; `contentType: "quick-replies"`                                                                                                                    |
| `Card` (or deprecated `GenericTemplate`) `{ id?, title, description, image, actions, components, defaultAction }` | **replaces** `card` with `{ id: id \|\| <generated>, title, description, imageUrl: image \|\| "", actions: defaultAction \|\| actions, buttons: components \|\| actions }`; `contentType: "card"`. Only the last Card survives                             |
| `Carousel` `{ cards: [{ id?, title, description, image, actions, defaultAction }] }`                              | `contentType: "carousel"` even if `cards` is empty. For a non-empty list, `carouselType: "Cards"` and **appends** to `carousel.cards[]`: `{ id, title, description, imageUrl: image \|\| "", actions: defaultAction, buttons: actions }`                   |
| `DatePicker` `{ title, subtitle, imageUrl, dateMinimum, dateMaximum, availableTimes }`                            | `contentType: "datepicker"`, `datePicker: { id: <raw message id>, title, description: subtitle \|\| "", imageUrl, dateMinimum, dateMaximum, availableTimes }` with `availableTimes` sorted by `dateTime` **in place**; plus `state`/`updatedTime` when set |
| `ListPicker` `{...}`                                                                                              | `contentType: "listpicker"`, `listPicker: { id: <raw message id>, ...rawListPicker }`; plus `state`/`updatedTime`                                                                                                                                          |
| `Form` `{...}` (outbound form, or the inbound reply's `{ originatingMessageId, cannedResponseId, response }`)     | `contentType: "form"`, `form: { id: <raw message id>, ...rawForm }`; plus `state`/`updatedTime`                                                                                                                                                            |
| `ButtonResponse` with `type: "DatePicker"`                                                                        | `contentType: "datepicker"`, `text`, `payload` (the ISO date), `imageUrl: ""`, `parentMessageId` (from `metadata.parentMessageId`)                                                                                                                         |
| `ButtonResponse` with `type: "ListPicker"`                                                                        | `contentType: "listpicker"`, `payload: [<raw buttonResponse>, ...]`, `parentMessageId`                                                                                                                                                                     |
| `ButtonResponse` with `type: "QuickReply"` or `"Button"`                                                          | **nothing**. Only the message's own `text` remains; there is no `contentType`, and `quickReplies`/`card` stay empty                                                                                                                                        |
| `events[]` `Presence` `{ presence: { type } }`                                                                    | `eventType: "Presence"`, `presence: { type }` (`"Join"`, `"Disconnect"`, `"Clear"`, `"SignIn"`, ...)                                                                                                                                                       |
| `events[]` `CoBrowse` / `Video`                                                                                   | `eventType: "CoBrowse"` / `"Video"`, `coBrowse` / `video: { id: id \|\| <generated>, ...raw }`                                                                                                                                                             |

```js
// genesyscloud-messaging-transport.mod.js, formatted (card branch)
const {
  id: t,
  title: n,
  description: o,
  image: s,
  actions: i,
  components: r,
  defaultAction: c,
} = e.generic || e.card;
let l = c || i,
  d = r || i;
f.contentType = 'card';
f.card = { id: t || a(), title: n, description: o, imageUrl: s || '', actions: l, buttons: d };
```

Consequences for a parser:

- **Card `actions` is not the action list.** It is `defaultAction` when the card has one (a single `{ type, url?, payload?, text? }` object), otherwise the `actions` array. Read the buttons from `card.buttons` (and `carousel.cards[].buttons`); read the tap target from `card.actions` only when it is not an array. In a carousel card, `actions` is the `defaultAction` or `undefined`.
- **"No card" is `card: {}`** (no keys; a real card always has a string `id`). **"No carousel" is `carousel.cards.length === 0`.** `datePicker`, `coBrowse` and `video` default to `{}`; `listPicker`, `form`, `contentType`, `eventType`, `presence`, `carouselType`, `state`, `updatedTime`, `payload` and `parentMessageId` are **absent** unless set.
- **Text plus attachment** is one formatted message with `text` set and one `files[]` item, `type: "text"`, and no `contentType`. An attachment-only message looks the same with `text` `undefined` or `""`.
- **A user's quick-reply or card answer** (`ButtonResponse` `QuickReply`/`Button`) is indistinguishable from typed text in history: `type: "structured"`, `messageType: "inbound"`, `text` = the button label.
- `contentType` keeps the **last** content item that set it. A message mixing quick replies and a card reports `"card"` but still carries both `quickReplies` and `card`.
- The `<generated>` ids come from a helper in the transport and change every time the message is formatted. Do not key UI state on a generated quick-reply or card id.

A parser for headless mode therefore needs two inputs: raw Guest API bodies (`messagesReceived`) and formatted messages (`restored`, `oldMessages`, `messagesUpdated`).

## What is filtered, and what is not

Live WebSocket messages (`messagesReceived`):

| Guest API message                                                           | Reaches `messagesReceived`?                                                                                                                                                                         |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Text`, `Structured` (both directions, including your echo)                 | yes                                                                                                                                                                                                 |
| `Event` with `eventType: "Presence"` (Join, Disconnect, Clear, SignIn, ...) | **yes**, the raw body. A Disconnect also publishes `conversationDisconnected` first                                                                                                                 |
| `Event` with `eventType: "CoBrowse"` or `"Video"`                           | yes, and also `cobrowseOffer*` / `videoOffer*`                                                                                                                                                      |
| `Event` with `eventType: "Typing"`                                          | **no**. Outbound typing publishes `typingReceived`; inbound typing is dropped                                                                                                                       |
| `Event` with any other `eventType`                                          | no                                                                                                                                                                                                  |
| `type: "Receipt"`                                                           | not filtered. No bundle mentions `Receipt` at all, so a receipt body with a `channel.time` would be published as a message. **UNVERIFIED** whether the Guest API ever sends receipts to a web guest |

History (`restored`, `oldMessages`): nothing is filtered by type. Messages already seen (same `channel.time` key) are skipped, and so is a message whose first content item is an attachment the user uploaded in this page session.

Side effect: formatting a message whose presence type is `Disconnect` calls the disconnect handler, so **`conversationDisconnected` is published again when a restored or fetched history page contains an old Disconnect event**, and on `restored` it can fire twice (history formatting, then the merge step formats every known message again). Handle `conversationDisconnected` idempotently.

## `sendingMessage`

```js
// genesyscloud-messaging-transport.mod.js, formatted
r = {
  action: 'onMessage',
  token,
  tracingId: i /* new UUID */,
  message: { metadata: { id: s /* new UUID */ } },
};
// ... r.message.type / text / content / events filled in by message kind ...
(n.sendOverSocket(r), n.onMessageSent({ ...r.message, tracingId: r.tracingId }));
// messagingservice.min.js
e.publish('sendingMessage', { message: t });
```

- `data.message` is the outgoing Guest API `message` object plus `tracingId`: `{ type, text?, content?, events?, metadata: { id }, channel?: { metadata: { customAttributes } }, tracingId }`.
- It is published **when the frame is written to the socket**, not when you call `sendMessage`. With rate limiting on, frames are queued and sent on an interval.
- It fires for every frame the SDK sends through that path, including the autoStart `Join` presence event (`type: "Event"`), co-browse and video events, and quick-reply / card button responses. Render `type` `"Text"` and `"Structured"` as pending bubbles, **and** a message with no `type` whose `content` holds an `Attachment` (an attachment sent without text, see below). Skip `type: "Event"`.
- Typing indicators are sent by a separate path and do not publish `sendingMessage`.

### What each `sendMessage` call puts on the wire

From the transport's `sendMessage` (search `case"quickReply"`):

| Options                                                                | `data.message` in `sendingMessage` (besides `metadata: { id }` and `tracingId`)                                                                                                                                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ message: 'hi' }`                                                    | `type: "Text"`, `text: "hi"` (trimmed by the plugin)                                                                                                                                                                                        |
| `{ message: 'hi' }` with a staged upload                               | `type: "Text"`, `text`, `content: [{ contentType: "Attachment", attachment: { id } }]`                                                                                                                                                      |
| `{}` or `{ message: '' }` with a staged upload                         | **no `type`, no `text`**, `content: [{ contentType: "Attachment", attachment: { id } }]`                                                                                                                                                    |
| `{}` or `{ message: '' }` with nothing staged                          | nothing. The frame is only sent when it has a `type` or `content`, so no frame and no `sendingMessage`, yet the command **resolves**                                                                                                        |
| `{ type: 'quickReply', postback: { text, payload } }`                  | `type: "Structured"`, `text`, `content: [{ contentType: "ButtonResponse", buttonResponse: { type: "QuickReply", text, payload } }]`                                                                                                         |
| `{ type: 'card', postback: { text, payload } }`                        | `type: "Structured"`, `text`, `content: [{ contentType: "ButtonResponse", buttonResponse: { type: "Button", text, payload } }]`                                                                                                             |
| `{ type: 'datePicker', postback: { id, payload: { dateTime } } }`      | `type: "Structured"`, `content: [{ contentType: "ButtonResponse", buttonResponse: { type: "DatePicker", text: postback.text \|\| <local date string>, payload: dateTime } }]`, `metadata.parentMessageId: id`                               |
| `{ type: 'listPicker', postback: { id, text, selectedOptions } }`      | `type: "Structured"`, `text`, one `ButtonResponse` per option `{ type: "ListPicker", text, payload, originatingMessageId: id }`, `metadata.parentMessageId: id`                                                                             |
| `{ type: 'form', postback: { id, text, cannedResponseId, formData } }` | `type: "Structured"`, `text`, `content: [{ contentType: "Form", form: { originatingMessageId: id, cannedResponseId, response: [{ id, component: { contentType: "ButtonResponse", buttonResponse: { type: "Form", text, payload } } }] } }]` |

- For `quickReply` and `card`, `text` is `postback.text` cut to the session's maximum message size with `"..."` appended when longer. A missing `postback.text` sends `""` and logs a warning. A missing `postback` throws inside the transport **after** the command has already resolved.
- A typed `type` reply replaces `content`, so a staged upload is not attached to it, but the upload is still marked as sent. Send staged files with a plain `sendMessage` first.
- The echoed `messagesReceived` body is whatever the Guest API sends back for that inbound message; the SDK only adds `tracingId`. The live session ("Observed in a live session" below) confirmed that a quick-reply echo keeps its content and that an attachment-only echo comes back with `type: "Text"`. **UNVERIFIED** (no live capture): the echo of picker and form replies, and of text with an attachment. In history, the `ButtonResponse` answers format to plain text (see the field table above).

### The "Message only contains whitespaces" rule

```js
// messagingservice.min.js, formatted (sendMessage command)
const n = e.data || {},
  o = n.message && !n.message.trim() && !N; // N: set by fileUploaded, cleared by every send, fileDeleted, fileUploadError, fileUploadCancelled
```

It rejects only a **non-empty, all-whitespace** `message` when no upload has completed since the last send. `{}` and `{ message: '' }` are never rejected. After `fileUploaded`, even `{ message: '   ' }` passes; the plugin trims it to `""` and the frame carries only the attachment.

## Files: allowed types, upload, `getFile`

### `allowedFileTypes`

```js
// genesyscloud-messaging-transport.mod.js, formatted (SessionResponse handling)
const { inbound: U } = T || {}, // T = body.allowedMedia
  { fileTypes: P, maxFileSizeKB: L } = U || {};
P &&
  P.length &&
  P.forEach((e) => {
    const { type: t } = e || {};
    D.push(t);
  });
// ... on a SessionResponse with connected === true:
((n.aAllowedFileTypes = D), L && (n.maxFileSizeKB = L), n.onAllowedFileTypesUpdated(p)); // p = the whole body
// messagingservice.min.js
t && t.hasOwnProperty('allowedMedia') && e.publish('allowedFileTypes', t);
```

- `data` is the **whole `SessionResponse` body**, not just `allowedMedia`: `{ connected, newSession, readOnly?, allowedMedia: { inbound: { fileTypes: [{ type }], maxFileSizeKB } }, maxCustomDataBytes?, durationSeconds?, expirationDate?, ... }`.
- Each `fileTypes` entry is an **object** `{ type: "<media type>" }`, not a string. The type is an RFC 2046 media type and may be a wildcard: the Platform API `MediaType.type` description says _"specific types such as 'image/jpeg', 'video/mpeg', or specify wild cards for a range of types, 'image/*', or all types '*/\*'"_ (swagger `MediaType`, https://api.mypurecloud.com/api/v2/docs/swagger, read 2026-10-01). These come from the Supported Content Profile.
- It is a plain `publish` (no replay), sent on **every** `SessionResponse` with `connected: true`, so on each connect and reconnect. Subscribe before the first command. Before any WebSocket session exists it has not been published; the deployment config's `messenger.fileUpload.modes[].fileTypes` (plain MIME strings) and `maxFileSizeKB` are the only source then (see "Reading the deployment configuration").

### The SDK does not check type or size

The transport stores `aAllowedFileTypes` and `maxFileSizeKB` and **never reads them** (those names appear only where they are assigned). `requestUpload` checks only: authenticating, conversations enabled, `fileUpload.enableAttachments` (`"Sending attachments is disabled in the configuration"`), and a read-only ended conversation. It then sends `{ action: "onAttachment", fileName, fileType, fileSize }` and the **server** decides.

Server refusals arrive as response frames with an error code. The transport sets `errorKey` from its table and publishes **`MessagingService.error`**, not `fileUploadError`:

| `body.errorCode` (or `code`) | `errorKey`              |
| ---------------------------- | ----------------------- |
| 4000                         | `FileUploadUnavailable` |
| 4001                         | `fileTypeInvalid`       |
| 4002                         | `fileTooLarge`          |
| 4003                         | `fileContentInvalid`    |
| 4004                         | `fileNameInvalid`       |
| 4005                         | `fileNameTooLong`       |
| 4011                         | `messageLengthExceeded` |
| 4102                         | `fileSizeZero`          |

So `data.error` is the frame `{ type: "response", class, code, body: { errorCode, errorMessage, attachmentId? }, tracingId, errorKey }`, deep-copied with `JSON.parse(JSON.stringify(...))`. The upload queue is cleared.

`fileUploadError` is published only when the HTTP `PUT` to the pre-signed `uploadURL` fails. Its `data` is `JSON.parse(JSON.stringify(axiosError))` from `MessengerHelper.uploadRequest` in `genesys.min.js`. Axios errors serialise through `toJSON()` to roughly `{ message, name, code, status, config, stack }`. **Inferred** from the code; the exact fields depend on the bundled Axios version.

`uploading` carries `{ percentage }` only (the helper's `loaded`/`total` are dropped). `fileUploaded` is `{ downloadUrl, attachmentId, timestamp }`, published when the server sends `UploadSuccessEvent`. `fileDeleted` is `{ attachmentId }`, and only for ids that `deleteFile` queued.

### `getFile` and `refreshFiles`

When the `getAttachment` response arrives for an id that `getFile` queued, the transport publishes `messagesUpdated` **first**, then `fileReceived`:

```js
// genesyscloud-messaging-transport.mod.js, formatted
s.onMessagesUpdated({
  viewFiles: { attachmentId: n, newDownloadUrl: o, updatedTime: new Date().toISOString() },
  updatedMessages: e,
});
s.onFileReceived({ downloadUrl: o, attachmentId: n, timestamp: a });
```

- `updatedMessages` is **every** formatted message the SDK holds whose `files[0].downloadUrl` is set, deep-copied, each with a fresh `updatedTime`. Only the one whose `files[0].id` matches gets the new `downloadUrl` and a `files[0].updatedTime`. It can be empty (for example a file never seen in this page session). Only `files[0]` is ever considered.
- `refreshFiles` publishes `{ updatedMessages }` built the same way, without `viewFiles` or `updatedTime`, and no `fileReceived`.
- Date picker, list picker and form replies also publish `messagesUpdated` `{ updatedMessages }`: copies of the original outbound message with `state: "consumed"` and `updatedTime`. It is published even when no original was found (`updatedMessages: []`).

Merge `updatedMessages` by `id`; never treat it as "the messages that changed".

## Event payloads (`data`), v2.18.0

| Event                      | `data`                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `started`                  | `{ newSession: boolean, authenticated, readOnly, durationSeconds?, expirationDate? }`. `authenticated` is the deployment's `authEnabled` (can be `undefined`) unless session upgrade is on. `readOnly` is the `SessionResponse`'s value, `undefined` when absent. Republished                                                                                          |
| `conversationReset`        | the same object as `started`, published just before it                                                                                                                                                                                                                                                                                                                 |
| `conversationDisconnected` | `{ message: <raw Disconnect presence body>, readOnly: true \| false \| undefined }`. `readOnly` comes from the message's `metadata.readOnly` string (`"true"` → `true`). Also fires when history containing an old Disconnect is formatted                                                                                                                             |
| `readOnlyConversation`     | two sources: (1) after a disconnect, when `conversationDisconnect` is enabled with type `ReadOnly`: the raw Disconnect body; (2) while restoring, on a `SessionResponse` whose `readOnly` is a boolean: the **whole frame** `{ type, class: "SessionResponse", code, body: { connected, newSession, readOnly, ... }, tracingId }`, **even when `readOnly` is `false`** |
| `conversationCleared`      | the whole `SessionClearedEvent` frame, `{ type: "message", class: "SessionClearedEvent", code?, body?, ... }`                                                                                                                                                                                                                                                          |
| `sessionCleared`           | none (the envelope's `data` is `{}`)                                                                                                                                                                                                                                                                                                                                   |
| `error`                    | `{ error }`, a deep copy of the response frame plus `errorKey` (see the table above), or of a connection error; `{ error: {} }` when the transport passes nothing                                                                                                                                                                                                      |
| `typingReceived`           | `{ typing: <the raw event's typing object> }`, for example `{ type: "On", durationMs: 5000 }`; the field names are whatever the server sends                                                                                                                                                                                                                           |
| `uploading`                | `{ percentage }`                                                                                                                                                                                                                                                                                                                                                       |
| `fileUploaded`             | `{ downloadUrl, attachmentId, timestamp }`                                                                                                                                                                                                                                                                                                                             |
| `fileUploadError`          | the serialised Axios error from the `PUT` (see above)                                                                                                                                                                                                                                                                                                                  |
| `fileDeleted`              | `{ attachmentId }`                                                                                                                                                                                                                                                                                                                                                     |
| `fileReceived`             | `{ downloadUrl, attachmentId, timestamp }`, after `messagesUpdated`                                                                                                                                                                                                                                                                                                    |
| `allowedFileTypes`         | the whole `SessionResponse` body (see above)                                                                                                                                                                                                                                                                                                                           |

## Reading the deployment configuration

```js
// genesys.min.js 2.14.0, global dispatcher, case "command"
a(e[2]) == z /* function */
  ? Ee({ commander: Z, command: e[1], data: {} }).then(e[2] || te, e[3] || te)
  : Ee({ commander: Z, command: e[1], data: e[2] || {} }).then(e[3] || te, e[4] || te);
```

- The global form works: `Genesys('command', 'GenesysJS.configuration', {}, resolve, reject)`, or with the options omitted, `Genesys('command', 'GenesysJS.configuration', resolve, reject)`. No `registerPlugin` is needed.
- It resolves with the trimmed public copy (see [loading-the-sdk.md](./loading-the-sdk.md#genesysjsconfiguration-is-a-trimmed-copy)). The trim removes only the listed paths, so `messenger.apps.conversations.{enabled, showAgentTypingIndicator, showUserTypingIndicator, autoStart, conversationDisconnect, conversationClear, notifications, sessionDurationSeconds}` and `messenger.fileUpload.{enableAttachments, modes: [{ fileTypes: ["image/jpeg", ...], maxFileSizeKB }]}` all survive. Measured by running the script's own `removeObjectProps` on a live `config.json` in Node.
- Timing: the command does not wait. Before `config.json` has loaded it rejects `"Deployment config is not available"`. The public copy is computed synchronously in `getConfig` before that command resolves, and `MessagingService` (with the other products) is initialised only after `getConfig` resolves. So it is **always available once `MessagingService.ready` has fired**. Confirmed by reading the code; not observed at runtime.
- `GenesysJS.configurationReceived` is republished with `{ deploymentConfig, snippetConfig }`, the **untrimmed** config (including `markdown`, `messenger.styles`, `position`, `messenger.launcherButton`, `messenger.homeScreen`). It is undocumented. Re-read on 2026-10-02 in `genesys.min.js` 2.14.0 from `apps.mypurecloud.com` (byte-identical to `.ie`):
  - **Headless mode does not gate it.** In `getConfig(...).then`, `GenesysJS.republish(EVENT_CONFIG_RECEIVED, config)` runs unconditionally. It comes _before_ the `status === 'Active'` check and before `initializeProducts`, which loads Messenger and so `MessagingService`. So it **always precedes `MessagingService.ready`**. An inactive deployment still publishes it.
  - **Replay.** CXBus `subscribe` (`function Te`) calls `ke(...)` with the stored data when the event's `republish` flag is set, so a late subscriber gets the payload immediately. The snippet queue (`Genesys.q`) drains only on `Genesys('executeQueue')`, which runs after the republish, so subscriptions queued by the snippet also get the replay.
  - **Envelope.** A live publish delivers `{ time, publisher, event, eventName, data }`. A replay delivers `{ time, publisher, event, data }` with **no `eventName`**. Read `envelope.data.deploymentConfig.messenger.styles.primaryColor`, `envelope.data.deploymentConfig.position.alignment`, and so on.
  - **Stability.** Undocumented, but Genesys' own `Cookies` and `LocalStorage` plugins subscribe to it (search `subscribe('GenesysJS.configurationReceived'`) to read `messenger.sessionPersistenceType`. It is also present, with the same trim list and `api-cdn` URL, in 2.10.23 (`prod-mec1`). Inferred: fairly stable, but not a contract.
  - **Not published** when the domain check fails (`getConfig` then never settles, so `executeQueue` never runs either), or when `config.json` fails to load.
  - The same object is in the data model at `GenesysJS.deploymentConfig`. `MessengerHelper` itself reads it with `MessengerHelper.data('GenesysJS.deploymentConfig')`, and plugin `data()` reads have no permission check.
- **The trimmed copy can fail where the untrimmed one does not.** `removeObjectProps` recurses into anything with `typeof === 'object'`, and `null` counts. Running the script's own function in Node on `{ video: null }`, or on a nested `null` outside the removed paths, threw `Cannot convert undefined or null to object`. The throw happens inside `setPublicConfig`'s promise, so the public copy stays `{}` and `GenesysJS.configuration` would reject `"Deployment config is not available"`. **UNVERIFIED** whether any real `config.json` contains `null`s.

## Command callbacks: when they fire and with what

| Command             | Fulfilled callback fires                                                                                                                             | Resolves with                                                                                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sendMessage`       | **immediately**, right after handing the message to the transport. The transport may still be connecting, queueing or rate-limiting                  | nothing (`undefined`)                                                                                                                                                                                               |
| `startConversation` | when the WebSocket **opens**, before the session is configured and before `started`                                                                  | nothing                                                                                                                                                                                                             |
| `fetchHistory`      | after the history HTTP request completes and `oldMessages`/`historyComplete` has been published                                                      | the same `{ messages, pageNumber, pageSize }` object as `oldMessages`. Or the **string** `"All the messages are fetched"` once history is complete, **or while offline** (the `offline` handler sets the same flag) |
| `requestUpload`     | **immediately** after queuing the upload                                                                                                             | nothing. Progress comes from `uploadApproved` → `uploading` → `fileUploaded` / `fileUploadError`                                                                                                                    |
| `sendTyping`        | immediately after handing the typing event to the transport (unless throttled, see below). The transport silently skips it when no WebSocket is open | nothing                                                                                                                                                                                                             |

Callbacks that **never fire** (neither fulfilled nor rejected), so a promise wrapper around them hangs:

- `sendTyping` while throttled. After a send it sets a 5 s timer, and calls during that window return without resolving or rejecting.
- `startConversation` while the transport is already connecting or connected but the session is not yet marked active (for example right after a `sendMessage` that opened the socket).
- `fetchHistory` when there is no active session and the session-storage flag exists but is not `"true"`.

Exact rejection strings in this version: `fetchHistory` rejects `"not able to fetch history"` (lower-case, no active session) and `"Unable to fetch history"` (request failed). `sendTyping` also rejects `"Typing indicator cannot be sent while authenticating"`, and `sendMessage` rejects `"Messages cannot be sent while authenticating"`. Any command rejects `"Conversation app must be enabled in your configuration."` when the conversations app is off.

Wrap commands with a timeout, and do not await `sendTyping`.

## Typing

```js
// messagingservice.min.js, formatted
M.onMessageReceived = (t) => {
  /* ... */ q && ((q = !1), M.clearTypingTimeout()); /* ... */
};
M.onTypingTimeout = () => {
  q && ((q = !1), e.publish('typingTimeout'));
};
```

- When **any** message arrives while the agent typing indicator is on, the SDK clears its typing timer and its "typing" flag **without publishing `typingTimeout`**. A UI that hides the indicator only on `typingTimeout` will show it until the next typing cycle. Hide it yourself on every `messagesReceived`. Genesys' native reducer does the same (`typingNotification: {}` on every received message).
- `typingReceived` is published only for **outbound** typing events. The timer uses `typing.duration || typing.durationMs || 5000`. Each new typing event restarts it.
- `sendTyping` has no check for `showUserTypingIndicator` (or any typing flag). Neither the plugin's command nor the transport's `sendTyping` reads deployment config for typing, and the strings `showUserTypingIndicator` / `showAgentTypingIndicator` appear in none of `genesys.min.js`, `messagingservice.min.js`, `genesyscloud-messaging-transport.mod.js`, `messagingMiddleware.min.js`, `main.min.js`, `engage.min.js` or `messengerrenderer.min.js`. In headless mode, honouring those flags is your job. **UNVERIFIED:** whether Genesys drops the typing event on the server when the flag is off.
- With autoStart on, the transport sends typing only after it has seen a Presence event (`bPresenceEvent`).
- Calling `sendTyping` publishes `clientTypingStarted` locally.

## History order and overlap

- `restored.messages` is **newest-first**. The transport merges the first history page with every message it has already seen, sorts the map keys (ISO `channel.time` strings) and reverses them (search `.sort().reverse()`). It is a snapshot of every message the SDK knows about, not just page 1.
- `oldMessages.messages` keeps the API's page order. Genesys' native reducers reverse **both** arrays before use (`messenger.min.js`: `case"RESTORED":let s=t.data.messages.reverse()` and `case"HISTORYFETCHED":let c=t.data.messages.reverse()` then `messages:[...c, ...existing]`), so the pages arrive **newest-first** as well. **UNVERIFIED** in the API docs, which do not state the order of `GET /api/v2/webmessaging/messages`.
- Paging: `restore` resets the page counter to 1 and increments it after loading, so the first `fetchHistory` after `restored` requests page 2. Messages already seen (same `channel.time` key) are dropped from each page, so `oldMessages` does not repeat what `restored` or `messagesReceived` delivered in this page session.
- Overlap can still happen across a reconnect. A `restore` of type `backOnline` (after `reconnected` / coming back online) clears the seen-map first, so the next `restored` repeats messages you already rendered. Merge `restored` into your transcript by id, do not append it.
- Premature `historyComplete`: the page counter only advances when a page yields at least one new message. A page that is entirely duplicates (possible when new live messages shift the server's pages) is published as `historyComplete`. After that, `fetchHistory` resolves `"All the messages are fetched"` without fetching. Inferred from the code; not observed live.

## Other payload corrections

- `MessagingService.error` publishes `{ error: <original error> }`, so the Guest API error object is at `data.error`, not `data`.
- `messagesUpdated` after `getFile` is `{ viewFiles: { attachmentId, newDownloadUrl, updatedTime }, updatedMessages }`. After `refreshFiles` it is `{ updatedMessages }` only.

## Observed in a live session (2026-10-01)

One headless session was run against a test deployment (autoStart off, Conversation Disconnect ReadOnly, Clear Conversation on, attachments on) from headless Chrome on `localhost`. The session started a conversation, sent text, a quick-reply postback and an attachment-only message, fetched history, reloaded the page, and ended with `clearConversation`. Every `MessagingService` event was logged. No agent joined, so agent typing and disconnect were not exercised. SDK: `genesys.js` 2.14.0, `messenger` 2.18.0. What it showed, beyond the source reading above:

- **Message ids differ between the two shapes.** A raw body in `messagesReceived` has `id` (a 32-hex server id) and, for inbound messages, `channel.messageId` (a UUID). The formatted shape in `restored`/`oldMessages` uses `channel.messageId || id` as its `id`. So the same message arrives with two different `id` values. **Key a raw message by `channel.messageId ?? id`** to match history. Outbound messages from a bot had no `channel.messageId`, and both shapes used the server `id`.
- **`expirationDate` is in seconds**, not milliseconds: `sessionTimingUpdated`, `started` and `allowedFileTypes` carried `expirationDate: 1791139139` alongside `durationSeconds: 259200`. Normalise before comparing with `Date.now()`. Whether `sessionWarning.expirationTime` is also in seconds was not observed (the warning only fires in the last 5 minutes).
- **Startup order** with no stored session: `sessionDurationConfigured`, `ready`, `allowedFileTypes`. With a stored session (after reload): `sessionDurationConfigured`, `ready`, `restoring`, `sessionTimingUpdated`, `allowedFileTypes`, `readOnlyConversation` (carrying the whole `SessionResponse` frame with `body.readOnly: false`), `started` (`newSession: false`), `restored`, `historyComplete`.
- **`allowedFileTypes` arrives before any conversation starts**, on the initial session handshake, with `fileTypes: [{ "type": "*/*" }]`, `maxFileSizeKB: 10240` and the `blockedExtensions` list.
- **`startConversation` with autoStart off** resolves with `undefined` and publishes `started` (`newSession: true`). No Join presence message appeared in `messagesReceived`.
- **Echoes carry the `tracingId`** of the matching `sendingMessage`, at `messages[0].tracingId`, for text, quick-reply postbacks and attachment-only messages.
- **A quick-reply postback** goes out as `{ type: "Structured", text, content: [{ contentType: "ButtonResponse", buttonResponse: { type: "QuickReply", text, payload } }] }`. The echo keeps that content. In history it becomes `type: "structured"` with `text` only.
- **An attachment-only message**: the `sendingMessage` frame has no `type` and no `text`. The echo has `type: "Text"`, no `text`, and `content[0].attachment` with `id`, `filename`, `fileSize`, `mediaType`, `mime`, `url`. In history it becomes `type: "text"`, no `text`, and `files[0]`.
- **`from` is `{}`** on both shapes for bot and customer messages in this deployment. Formatted messages had no `contentType` for plain text.
- **`fetchHistory`** right after `restored` resolved with `{ messages: [], pageNumber, pageSize }` and published `historyComplete` when the conversation fitted in one page.
- **`clearConversation`** resolved with the `SessionClearedEvent` frame. `conversationCleared` carried the same frame, and `messagesReceived` delivered a raw `Event` body with `presence.type: "Clear"`.

## Observed in a live session (2026-10-02)

One more headless session against the same test deployment, from headless Chrome on `localhost`, after the native-look contribution. It sent one customer message, reloaded, and cleared.

- **`GenesysJS.configurationReceived` works in headless mode.** A subscription made after the SDK loaded was answered with the untrimmed config. The deployment's `messenger.styles.primaryColor` (`#000000`), `position` (`Auto`, 20, 12), `launcherButton` (`visibility: "Off"`, `displayType: "IconAndText"`), `homeScreen.enabled: false` and humanize off all came through.
- **The native UI stays invisible.** The page held four Genesys iframes (`genesys-thirdparty-frame`, an unnamed one, `genesys-mxg-frame`, `genesys-mxg-container-frame`), all 0×0, and nothing native was drawn. This settles the runtime half of [other-plugins.md](./other-plugins.md#launcher-and-messenger-ui-plugins-mostly-na-in-headless-mode).
- **A first `sendMessage` with no session opens one.** With autoStart off and no stored session, sending text moved the UI from idle to active with history complete, which only `started` with `newSession: true` does. There is no Start button, and no `startConversation` was sent.
- **A deployment for a custom UI may hide the launcher.** This one has launcher visibility `Off`, as Admin advises ("Use Always hide if you build your own custom Messenger"). A UI that honours the setting must give the page another way in.
- No console errors or warnings during load, send, reload or clear.
