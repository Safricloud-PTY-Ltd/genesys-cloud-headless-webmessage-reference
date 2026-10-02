# MessagingService plugin (the core headless API)

Primary source (all commands and events below, unless noted otherwise): https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messagingServicePlugin

Message object schema source: https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi (the `body` of `StructuredMessage`)

> _"Please subscribe to ready event before calling any MessagingService plugin commands."_ In headless mode the plugin is **always loaded**, and `MessagingService.ready` is always published.

## Commands

All commands are called as `Genesys("command", "MessagingService.<name>", options, onResolved, onRejected)`.

| Command                 | Options                                           | Resolves / events published                                                                                                                                               | Rejects with (exact message)                                                                                                       |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `startConversation`     | `{}`                                              | `MessagingService.started`                                                                                                                                                | "Cannot start conversation"; "There is already an active conversation"                                                             |
| `configureConversation` | `{}`                                              | `MessagingService.started`. Opens the WebSocket and configures the session but does **not** send JOIN when autoStart is on                                                | same as above                                                                                                                      |
| `joinConversation`      | `{}`                                              | Sends JOIN. **Headless only**, used after `configureConversation`                                                                                                         | "Auto start must be enabled in the configuration"                                                                                  |
| `sendMessage`           | `{ message }` or `{ type, postback }` (see below) | `messagesReceived`. For datePicker/listPicker/form it publishes `repliedMessage`                                                                                          | "Message only contains whitespaces"; "Conversation session has ended, start a new session to send a message."                      |
| `sendTyping`            | none                                              | Throttled. _"a typing event will only be sent once every 5 seconds"_                                                                                                      | "Conversation session has ended, start a new session to send a typing indicator."                                                  |
| `clearTypingTimeout`    | `{}`                                              | Clears the **agent** typing timeout (for example when the user starts typing)                                                                                             | never                                                                                                                              |
| `requestUpload`         | `{ file: FileList }` (one file)                   | `uploadApproved` → `uploading` → `fileUploaded` / `fileUploadError`. No client-side type or size check: a refused type/size arrives as `MessagingService.error`           | "Sending attachments is disabled in the configuration"; "Conversation session has ended, start a new session to upload a file."    |
| `getFile`               | `{ id: attachmentId }`                            | `messagesUpdated` (`{ viewFiles, updatedMessages }`) then `fileReceived` (fresh download URL)                                                                             | never                                                                                                                              |
| `refreshFiles`          | `{ files: [{ id }, ...] }`                        | `messagesUpdated`                                                                                                                                                         | never                                                                                                                              |
| `downloadFile`          | `{ downloadUrl, name }`                           | `fileDownloaded` / `fileDownloadError`. Saves the file to the local file system                                                                                           | download failure                                                                                                                   |
| `deleteFile`            | `{ id }`                                          | `fileDeleted`. Works only for files uploaded but **not yet sent**                                                                                                         | "Conversation session has ended, start a new session to delete a file."                                                            |
| `fetchHistory`          | `{}`                                              | `oldMessages` (one page) or `historyComplete`                                                                                                                             | "Not able to fetch history" (no active conversation); error → `MessagingService.error`                                             |
| `clearSession`          | `{}`                                              | `sessionCleared`. _"Closes the current websocket connection and clears the current active session messages from the transcript."_                                         | never                                                                                                                              |
| `resetConversation`     | `{}`                                              | `conversationReset` → `{authenticated, newSession, readOnly:false}`. Only after a disconnect in **ReadOnly** mode                                                         | "Conversation reset is not allowed. Check your configuration if Read only conversation disconnect is enabled."                     |
| `clearConversation`     | `{}`                                              | `conversationCleared` → `{"class":"SessionClearedEvent","type":"message"}`. **Final and non-recoverable**: removes the interaction from the queue or forces agent wrap-up | "Please check your conversation clear option is enabled in your configuration."; "There is no active conversation found to clear." |
| `stepUpConversation`    | `{}`                                              | `steppedUpConversation` → resolves `{authCode, jwt}`. Calls your `AuthProvider.signIn`                                                                                    | several, see [other-plugins.md](./other-plugins.md#auth--authprovider-authenticated-messaging)                                     |

### Starting a conversation

```js
Genesys(
  'command',
  'MessagingService.startConversation',
  {},
  function () {
    /*fulfilled callback*/
  },
  function () {
    /*rejected callback*/
  },
);
```

The decision rules, from the command docs, the headless page, and a Genesys staff answer:

- `sendMessage` creates a connection if none exists: _"If there is no active connection/session, a new connection will be created before sending the message."_ `sendTyping` behaves the same way. You therefore do not have to call `startConversation` before the first message.
- **autoStart off:** use `startConversation`, or just `sendMessage`. The conversation is created by the first inbound message.
- **autoStart on:** either
  - `startConversation`, which configures the session and sends JOIN if it is a new session, **or**
  - `configureConversation` now, then `joinConversation` later (for example when the user opens your chat panel). Check `newSession` on `MessagingService.started` to know whether a JOIN is needed.
- Do **not** combine `startConversation` with `configureConversation`. Both establish the session, and you get "There is already an active conversation". Genesys staff confirmed this: https://community.genesys.com/discussion/messagingservicestartconversation-does-not-trigger-backend-post-in-headlessmodetrue
- Caveat (verbatim): _"If the conversation is not started but the Messenger/page is reloaded, then it will no more be a new conversation as it will try to restore the existing conversation that was configured earlier. You must clear this conversation using MessagingService.clearConversation command and configure a new one to autostart."_
- With Auth **and** autoStart enabled in headless mode, the SDK auto-connects and may auto-start. To prevent this, set `AuthProvider.data('settings', { headless: { configureOnly: true } })`, then call `joinConversation` later. See [other-plugins.md](./other-plugins.md#auth--authprovider-authenticated-messaging).

Sources:

- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK#automatically-starting-the-conversation
- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/authProviderPlugin#authentication-with-autostart-enabled

### Sending text

```js
Genesys(
  'command',
  'MessagingService.sendMessage',
  {
    message: 'hi there!',
  },
  function () {
    /*fulfilled callback*/
  },
  function () {
    /*rejected callback*/
  },
);
```

`sendMessage` options:

| Option   | Type   | Required | Description                                                                                                                                                              |
| :------- | :----- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| message  | String | yes      | The text message that needs to be sent                                                                                                                                   |
| type     | String | yes      | Specify the Richmedia or form/datePicker/listPicker message type. It is a required field when sending such message type.                                                 |
| postback | Object | yes      | Object containing the corresponding Richmedia or form/datePicker/listPicker payload and text data that is sent based on the message type as shown in the examples above. |

_"Option 'message' is not required when you want to send only the file."_ In 2.18.0, `{}` and `{ message: '' }` are never rejected; "Message only contains whitespaces" applies only to a non-empty all-whitespace `message` with no completed upload. `{}` with nothing staged resolves and sends nothing. For `type`/`postback` (quick replies, cards, pickers, forms), see [structured-messages.md](./structured-messages.md).

### Sending a file

```js
const url = '<ImageUrl>';
let fileN = '';

fetch(url).then(async (response) => {
  const contentType = response.headers.get('content-type');
  const blob = await response.blob();
  fileN = new File([blob], 'Name', { type: contentType });
  var dt = new DataTransfer();
  dt.items.add(fileN);
  var file_list = dt.files;
  Genesys(
    'command',
    'MessagingService.requestUpload',
    {
      file: file_list,
    },
    function () {
      /*fulfilled callback*/
    },
    function () {
      /*rejected callback*/
    },
  );
});
```

In a real UI, pass `input.files` from an `<input type="file">` directly. The option is an HTML5 `FileList`, and _"Only one file can be uploaded at a time."_

Flow: `requestUpload` → `uploadApproved` (`{attachmentId, headers, uploadURL}`; the SDK uploads for you) → `uploading` (`{percentage}`) → `fileUploaded` (`{attachmentId, downloadUrl, timestamp}`) → `sendMessage` (with or without text). _"[sendMessage] automatically sends the most recently uploaded file as attachment."_ To remove a staged file before sending, use `deleteFile({id})`.

### History

```js
Genesys(
  'command',
  'MessagingService.fetchHistory',
  {},
  function () {
    /*fulfilled callback*/
  },
  function () {
    /*rejected callback*/
  },
);
```

Each call fetches the previous page. It publishes `oldMessages` (`{messages, pageNumber, pageSize}`) until no pages remain, then `historyComplete`. It requires an active conversation session.

## Events

All events are received via `Genesys("subscribe", "MessagingService.<name>", ({ data }) => {...})`.

### Lifecycle and connection

| Event                          | Payload (`data`)                                                                                                                   | Notes                                                                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ready`                        | none                                                                                                                               | Always published in headless mode                                                                                                                     |
| `started`                      | `{ newSession: bool, authenticated, readOnly, durationSeconds?, expirationDate? }` (`authenticated`/`readOnly` may be `undefined`) | New WebSocket connection established                                                                                                                  |
| `restored`                     | `{ messages: [msg], pageNumber, pageSize }`                                                                                        | Session restored after navigation or refresh. _"may not include all the messages… but a limited set of recent messages"_. Use `fetchHistory` for more |
| `offline`                      | none                                                                                                                               | Connectivity lost                                                                                                                                     |
| `reconnecting`                 | none                                                                                                                               |                                                                                                                                                       |
| `reconnected`                  | none                                                                                                                               |                                                                                                                                                       |
| `sessionCleared`               | none                                                                                                                               | After `clearSession`                                                                                                                                  |
| `conversationDisconnected`     | `{ message: msg, readOnly: bool }`                                                                                                 | Agent or flow disconnected. Requires **Conversation Disconnect** to be enabled in config (see gotchas)                                                |
| `readOnlyConversation`         | disconnect message body, **or** (while restoring) the whole `SessionResponse` frame, even when `readOnly` is `false`               | After a disconnect in ReadOnly mode                                                                                                                   |
| `conversationReset`            | same object as `started` (published just before it)                                                                                | After `resetConversation`                                                                                                                             |
| `conversationCleared`          | the whole `SessionClearedEvent` frame: `{ "class": "SessionClearedEvent", "type": "message", ... }`                                | After `clearConversation`                                                                                                                             |
| `error`                        | `{ error }`: Guest API error frame (see below) plus `errorKey`. Also carries upload refusals (4001 `fileTypeInvalid`, ...)         | Client/server error                                                                                                                                   |
| `customAttributesSizeExceeded` | `{ "body": "customAttributes object is larger than allowed limit: 2048 bytes", "errorKey": "customAttributesSizeExceeded" }`       |                                                                                                                                                       |
| `sessionDurationConfigured`    | `{ sessionDurationSeconds }`                                                                                                       | At init when a guest session duration is configured                                                                                                   |
| `sessionTimingUpdated`         | `{ durationSeconds, expirationDate /* ms */ }`                                                                                     | During an active conversation                                                                                                                         |
| `sessionWarning`               | `{ expirationTime /* ms */ }`                                                                                                      | During the last 5 minutes before expiry                                                                                                               |

### Messages

| Event              | Payload (`data`)                                                                        | Notes                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sendingMessage`   | `{ message: { type?, text?, content?, metadata, tracingId } }`                          | Published after an inbound send. Render the message as "sending"                                                                                                          |
| `messagesReceived` | `{ messages: [msg] }`                                                                   | **Any** new message, both directions (your own echoed inbound messages and agent/bot outbound messages). Match `tracingId` from `sendingMessage` to mark a message "sent" |
| `repliedMessage`   | see [structured-messages.md](./structured-messages.md#repliedmessage-payloads)          | The user replied to a datePicker, listPicker or form                                                                                                                      |
| `oldMessages`      | `{ messages: [msg], pageNumber, pageSize }`                                             | From `fetchHistory`                                                                                                                                                       |
| `historyComplete`  | none                                                                                    | No older pages remain                                                                                                                                                     |
| `messagesUpdated`  | `{ viewFiles?: { attachmentId, newDownloadUrl, updatedTime }, updatedMessages: [msg] }` | Fresh attachment URLs (`viewFiles` only after `getFile`), and consumed pickers/forms. `updatedMessages` holds every file message, not only the changed one                |

`tracingId` sits at the top level of each received message: `data.messages[0].tracingId`. The SDK copies it from the WebSocket frame onto the raw Guest API body. `messagesReceived.messages` always holds one raw body, but `restored`, `oldMessages` and `messagesUpdated` carry the SDK's **formatted** shape (lower-case `type`/`messageType`, `files`, `quickReplies`, ...). `sendingMessage` fires when the frame is written to the socket, including for the autoStart Join event. `error` publishes `{ error }`. Payload corrections for every event above are in [sdk-source-notes.md](./sdk-source-notes.md#event-payloads-data-v2180). Source: `messagingservice.min.js` / `genesyscloud-messaging-transport.mod.js` 2.18.0, read 2026-10-01; see [sdk-source-notes.md](./sdk-source-notes.md#message-objects-two-shapes).

### Typing

| Event                 | Payload                                                                    | Notes                                                       |
| --------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `typingReceived`      | `{ typing: <raw typing object> }`, e.g. `{ type: "On", durationMs: 5000 }` | Agent is typing                                             |
| `typingTimeout`       | none                                                                       | Agent typing expired after `durationMs`. Hide the indicator |
| `clientTypingStarted` | none                                                                       | End user started typing                                     |

### Files

| Event                 | Payload                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `uploadApproved`      | `{ attachmentId, headers: {}, uploadURL }`                                                                              |
| `uploading`           | `{ percentage: number }`                                                                                                |
| `fileUploaded`        | `{ attachmentId, downloadUrl, timestamp }`                                                                              |
| `fileUploadError`     | the serialised Axios error when the `PUT` to `uploadURL` fails. Server refusals (4001–4005, 4102) go to `error` instead |
| `fileUploadCancelled` | `{ attachmentId }`                                                                                                      |
| `fileReceived`        | `{ attachmentId, downloadUrl, timestamp }` (from `getFile`, after `messagesUpdated`)                                    |
| `fileDownloaded`      | none                                                                                                                    |
| `fileDownloadError`   | error format                                                                                                            |
| `fileDeleted`         | `{ attachmentId }`                                                                                                      |
| `allowedFileTypes`    | the whole `SessionResponse` body, including `allowedMedia: { inbound: { fileTypes: [{ type: "image/png"                 | "image/*" | ... }], maxFileSizeKB } }` (Supported Content Profile). Published on every connect; no replay |

### Co-browse and auth (for completeness)

`cobrowseOffer`, `cobrowseOfferAccepted`, `cobrowseOfferRejected`, `cobrowseOfferExpired` → `{ id, sessionId, sessionJoinToken?, type: "Offering" | "OfferingAccepted" | "OfferingRejected" | "OfferingExpired" }`. `steppedUpConversation` → a Presence `SignIn` event message. `stepUpConversationError` appears in the resolution table but has no section of its own.

## Message object

The docs point to the Guest API outbound `body` for the message format: _"This message object data format applies to each message object inside the messages array."_ Shape, consolidated from the Guest API examples and the Platform API `WebMessagingMessage` schema:

```jsonc
{
  "id": "896ab858-...",                 // message id
  "direction": "Inbound" | "Outbound",  // from Genesys' perspective: Inbound = from the customer
  "type": "Text" | "Structured" | "Event" | "Receipt",
  "text": "Hello, how may I help you today?",
  "content": [ /* WebMessagingContent: Attachment | QuickReply | ButtonResponse | Card | Carousel | DatePicker | ListPicker | Form */ ],
  "events":  [ /* for type "Event": { eventType: "Presence" | "Typing" | "CoBrowse" | "Video", presence: { type: "Join"|"Disconnect"|"Clear"|"SignIn"|"SessionExpired" } } */ ],
  "channel": {
    "time": "2020-12-14T16:23:44.843Z",   // ISO-8601 timestamp
    "messageId": "896ab858-...",
    "from": { "nickname": "Agent nickname", "image": "https://url.to.agent.avatar", "firstName": "...", "lastName": "..." }
  },
  "originatingEntity": "Human" | "Bot",  // outbound only
  "metadata": { "correlationId": "..." }
}
```

Attachment content item (Guest API example):

```json
{
  "attachment": {
    "id": "b0262692-9496-415d-8cc0-e735fbeb82d2",
    "mediaType": "Image",
    "mime": "image/jpeg",
    "url": "https://api.mypurecloud.com/api/v2/downloads/{downloadId}"
  },
  "contentType": "Attachment"
}
```

The `WebMessagingAttachment` schema also has `filename`, `fileSize`, `text` (caption) and `sha256`. `mediaType` is one of `Image | Video | Audio | File | Link`. Attachment URLs are signed and expire, so use `getFile` / `refreshFiles` to refresh them.

Sources:

- https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi#outbound-messages
- Platform API swagger `WebMessagingMessage`, `WebMessagingContent`, `WebMessagingChannel`, `WebMessagingRecipient`, `WebMessagingAttachment`, `WebMessagingEventPresence` (https://api.mypurecloud.com/api/v2/docs/swagger)

What the SDK changes (source-read 2026-10-01, see [sdk-source-notes.md](./sdk-source-notes.md#what-is-filtered-and-what-is-not)): `messagesReceived` gets the raw body plus `tracingId` (and `state`/`updatedTime` on picker/form replies). Presence events (Join, Disconnect, ...) **do** appear in `messagesReceived`, `restored` and `oldMessages`. Typing events do not. Receipts are not filtered by the SDK (**UNVERIFIED** whether the Guest API sends them). History is formatted, newest-first, and de-duplicated against messages already seen, using `channel.time` as the key. Render `Text`/`Structured`, show Disconnect as a status line, ignore unknown types.

## Error format (`MessagingService.error`, `fileUploadError`, ...)

```json
{
  "type": "response",
  "class": "GenerateUrlError",
  "code": 400,
  "tracingId": "11111111-1111-1111-1111-111111111111",
  "body": {
    "errorCode": 4001,
    "errorMessage": "File type image/tiff not supported",
    "attachmentId": "00000-0000-0000-0000000"
  }
}
```

`class` is one of `string` (body is a plain string), `ErrorMessage`, `GenerateUrlError`, or `TooManyRequestsErrorMessage` (body includes `retryAfter` in seconds). Codes include 400/401/403/404/408/409 (read-only)/429 and 4001–4017. Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi#troubleshoot-errors

## Minimal wiring sketch

This is illustrative and not from Genesys docs. It uses only the documented names above.

```js
const on = (evt, fn) => Genesys('subscribe', `MessagingService.${evt}`, fn);
const cmd = (name, opts = {}) =>
  new Promise((res, rej) => Genesys('command', `MessagingService.${name}`, opts, res, rej));

on('restored', ({ data }) => render(data.messages, { replace: true }));
on('messagesReceived', ({ data }) => render(data.messages));
on('oldMessages', ({ data }) => prepend(data.messages));
on('historyComplete', () => hideLoadOlder());
on('sendingMessage', ({ data }) => markPending(data.message.tracingId, data.message.text));
on('typingReceived', () => showAgentTyping(true));
on('typingTimeout', () => showAgentTyping(false));
on('conversationDisconnected', ({ data }) => showEnded(data.readOnly));
on('offline', () => setStatus('offline'));
on('reconnected', () => setStatus('online'));
on('error', ({ data }) => console.error(data));

on('ready', () => {
  sendBtn.onclick = () => cmd('sendMessage', { message: input.value }).catch(showError);
  input.oninput = () => cmd('sendTyping').catch(() => {});
  olderBtn.onclick = () => cmd('fetchHistory').catch(() => {});
});
```
