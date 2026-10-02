# Structured messages: quick replies, cards, carousels, pickers, forms

Structured messages arrive as message objects with `type: "Structured"` and a `content[]` array (see [messaging-service.md](./messaging-service.md#message-object)). Each content item has a `contentType` and a matching property.

`contentType` enum (Platform API `WebMessagingContent`): `Attachment | QuickReply | ButtonResponse | GenericTemplate | Card | Carousel | DatePicker | ListPicker | Form`. `GenericTemplate`/`generic` is marked deprecated.

Sources:

- Outbound shapes: https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi#outbound-messages
- How to reply via the SDK: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messagingServicePlugin#messagingservice-sendmessage
- Field schemas: https://api.mypurecloud.com/api/v2/docs/swagger (`WebMessagingContent`, `ContentCard`, `ContentCardAction`, `ContentCarousel`, `WebMessagingQuickReply`, `WebMessagingButtonResponse`, `ContentDatePicker`, `ConversationContentListPicker`, `ConversationContentForm`)

## Quick replies

Received (outbound `content[]`, verbatim from the Guest API):

```json
"content": [
  {
    "contentType": "QuickReply",
    "quickReply": {
      "text": "Red",
      "action": "Message",
      "payload": "RED"
    }
  },
  {
    "contentType": "QuickReply",
    "quickReply": {
      "text": "Green",
      "action": "Message",
      "payload": "GREEN"
    }
  }
]
```

`quickReply` fields: `text`, `payload`, `image?` (URL), `action` (`"Message"`).

Reply via the SDK (verbatim):

```js
Genesys(
  'command',
  'MessagingService.sendMessage',
  {
    type: 'quickReply', //Mandatory field specifying the Rich media type
    postback: {
      action: 'Message', //Optional
      text: 'I like movies', //Mandatory field containing the quick reply text
      payload: 'I like movies', //Mandatory field containing the quick reply payload
    },
  },
  function () {
    /*fulfilled callback*/
  },
  function () {
    /*rejected callback*/
  },
);
```

On the wire, this becomes an inbound `ButtonResponse` with `type: "QuickReply"`. The echoed inbound message has `type: "Structured"` and `text` equal to the reply text.

The Guest API also shows an outbound message whose content is `ButtonResponse` items (`buttonResponse: {text, type: "QuickReply", payload}`). Handle both `QuickReply` and `ButtonResponse` content when rendering.

**UNVERIFIED (UX rule):** the docs do not say whether quick replies should be hidden after the user answers, or once a later message arrives. Common practice is to show them only on the latest message.

## Cards

Received (verbatim, Guest API):

```json
{
  "contentType": "Card",
  "card": {
    "title": "50% off Flights to Norway",
    "description": "Valid September to November only",
    "image": "https://www.samplesite.com/photo/1234.jpg",
    "defaultAction": {
      "type": "Link",
      "url": "http://www.samplesite.com/flights/norway"
    },
    "actions": [
      {
        "type": "Link",
        "text": "View Details",
        "url": "http://www.samplesite.com/flights/norway"
      },
      {
        "type": "Postback",
        "text": "Book Now",
        "payload": "I want it"
      }
    ]
  }
}
```

`ContentCard` fields: `title`, `description`, `image?`, `video?`, `defaultAction?`, `actions[]`. `ContentCardAction` has `type: "Link" | "Postback"`, `text`, `payload` (Postback), and `url` (Link).

- **Link** action: open `url` yourself (for example `window.open(url, "_blank", "noopener")`). Nothing is sent to Genesys. **UNVERIFIED:** whether the native UI sends anything on Link clicks.
- **Postback** action: send it back with `sendMessage` (verbatim):

```js
Genesys(
  'command',
  'MessagingService.sendMessage',
  {
    type: 'card', //Mandatory field specifying the Rich media type
    postback: {
      text: 'Click Me!', //Mandatory field containing the cards text
      payload: 'Click Me!', //Mandatory field containing the cards payload
    },
  },
  function () {
    /*fulfilled callback*/
  },
  function () {
    /*rejected callback*/
  },
);
```

The equivalent Guest API inbound is `type: "Structured"` with `ButtonResponse` `{ text: "Book Now", type: "Button", payload: "I want it" }`.

## Carousels

A carousel is a set of cards:

```json
{
  "contentType": "Carousel",
  "carousel": {
    "cards": [/* ContentCard, same shape as above */]
  }
}
```

Reply to a postback in a carousel card the same way as for a card. The SDK docs title the example "Example for cards/carousel" and use `type: "card"`. **UNVERIFIED:** whether `type: "carousel"` is also accepted. Use `"card"` as documented.

## Date picker, list picker and form: sources

Read on **2026-10-01**:

- Schemas: Platform API swagger, https://api.mypurecloud.com/api/v2/docs/swagger (redirects to `publicapi-v2-latest.json`). Definitions quoted below by name.
- What the SDK does: `genesyscloud-messaging-transport.mod.js` and `messagingservice.min.js` (`messenger` 2.18.0) from `https://apps.mypurecloud.ie/messenger/`. See [sdk-source-notes.md](./sdk-source-notes.md) for how they were found.
- What Genesys' own UI does: `https://apps.mypurecloud.ie/messenger/messenger.min.js` (components) and `main.min.js` (shared helpers), same date. These are not a contract; they show one reasonable way to render and validate.
- The Guest API page (https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi) still has **no verbatim outbound example** of any of the three. No live payload of these three types has been captured. The shapes below are the schema, and the SDK passes them through unchanged (see "What the transport passes through").

Search strings in the minified files are given so you can find the code again.

## What the transport passes through

`messagesReceived` delivers the raw Guest API body, plus `tracingId` (see [sdk-source-notes.md](./sdk-source-notes.md#messagesreceived-the-raw-guest-api-body-plus-tracingid)). The transport does not touch `content[].datePicker`, `listPicker` or `form`, with one side effect: when it **formats** a message containing a `DatePicker` it sorts `availableTimes` by `dateTime` **in place** (`c.sort(...)` in `formattedMessage`), and the raw body it keeps is the same object. Do not rely on the order either way; sort yourself.

Every raw message carries `metadata` (swagger `WebMessagingMessage.metadata`, a string map). Replies use `metadata.parentMessageId` (see below).

## Date picker

### Received (raw, `messagesReceived`)

`contentType: "DatePicker"`, property `datePicker`, schema `ContentDatePicker`:

| Field                        | Type                | Notes                                                                                                                         |
| ---------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `title`                      | string              | "Text to show in the title."                                                                                                  |
| `subtitle`                   | string              | "Text to show in the description."                                                                                            |
| `imageUrl`                   | string              |                                                                                                                               |
| `dateMinimum`, `dateMaximum` | ISO-8601 date-time  | "The minimum/maximum Date Enabled in the datepicker calendar". Genesys' UI ignores both for a stand-alone date picker         |
| `availableTimes`             | array, **required** | items `ContentDatePickerAvailableTime`: `{ dateTime: ISO-8601, duration: integer seconds }`; neither field is marked required |

There is no `id` on a stand-alone `ContentDatePicker`. The message's own `id` identifies it.

### Formatted (`restored`, `oldMessages`, `messagesUpdated`)

```js
// genesyscloud-messaging-transport.mod.js, formatted (search: e.datePicker || {})
f.contentType = 'datepicker';
f.datePicker = {
  id: i /* raw message id */ || a(),
  title,
  description: subtitle || '',
  imageUrl,
  dateMinimum,
  dateMaximum,
  availableTimes /* sorted */,
};
u && (f.state = u); // raw message's state, e.g. "consumed"
p && (f.updatedTime = p);
```

`subtitle` is renamed `description`. `state` and `updatedTime` are top-level on the formatted message, not inside `datePicker`.

### How Genesys' UI renders it

- In the transcript: a card with `datePicker.title`, `description` and `imageUrl` (the card renders nothing without a `title`), and one button labelled from i18n `selectTimeButton`. When `state === "consumed"` the button reads `timeSelectedText` and is **disabled** (search `timeSelectedText`).
- The button opens a panel. Slots are grouped by **calendar day in the browser's local time zone**: each `dateTime` goes through `dayjs(dateTime).format("L")` (search `format("L")`), and the bundle uses no dayjs timezone plugin (no `.tz(` anywhere). Day headings use `"dddd, MMM D, YYYY"` (`"LL dddd"` for `ja`); slot labels use `"LT"` (`"HH:mm"` for `hi`), so "5:30 PM".
- Up to 4 days: one section per day, 4 slots each, with a show more / show less toggle when a day has more than 4. More than 4 days: a month `<select>` and a horizontal day strip, then all slots for the chosen day.
- **`duration` is never displayed.** `dateMinimum`/`dateMaximum` are not used. An empty `availableTimes` shows `timeSlotsUnavailable` text.
- One slot is selected at a time; the send button is disabled until one is.

### Reply

The documented command (verbatim from the SDK docs; the original is missing a comma after the options object):

```js
Genesys(
  'command',
  'MessagingService.sendMessage',
  {
    type: 'datePicker', //Mandatory field specifying the date picker message type
    postback: {
      payload: {
        duration: '1700', // Mandatory field containing the duration value coming from the initial outbound message
        dateTime: '2025-06-26T17:30:00.000Z', // Mandatory field containing the time value that you want to schedule coming from the initial outbound message (ISO-8601 Compliant)
      },
      id: '', // Optional field containing the message id of outbound datePicker message.
    },
  },
  function () {
    /*fulfilled callback*/
  },
  function () {
    /*rejected callback*/
  },
);
```

What the transport actually builds (search `case"datePicker"`):

```js
// genesyscloud-messaging-transport.mod.js, formatted
const { payload: s, id: i, text: c } = e.postback || {},
  { dateTime: d } = s || {};
let h = '';
d && (h = new Date(d));
r.message.type = 'Structured';
r.message.content = [
  {
    contentType: 'ButtonResponse',
    buttonResponse: {
      type: 'DatePicker',
      text: c || `${h && h.toLocaleString()}` || '',
      payload: d,
    },
  },
];
i && (r.message.metadata.parentMessageId = i);
```

- **`postback.payload.duration` is dropped.** The docs call it mandatory; nothing reads it. Send it anyway to match the docs.
- **`postback.text` is honoured though undocumented.** Without it the button text is `new Date(dateTime).toLocaleString()` in whatever locale the Messenger iframe runs. Genesys' UI sends no `text` (its postback is `{ id, payload: { dateTime, duration, imageUrl } }`, search `Sending selected dateTime`), so agents see a browser-formatted string. Send your own `text` if you want a predictable label.
- The message has **no top-level `text`**.
- `postback.id` becomes `metadata.parentMessageId`; without it nothing links the reply to the picker.
- The plugin does not validate the postback (`sendMessage` only checks the whitespace rule and session state).

`sendingMessage` `data.message`:

```jsonc
{
  "type": "Structured",
  "content": [
    {
      "contentType": "ButtonResponse",
      "buttonResponse": {
        "type": "DatePicker",
        "text": "<postback.text or toLocaleString()>",
        "payload": "<dateTime>",
      },
    },
  ],
  "metadata": { "id": "<uuid>", "parentMessageId": "<postback.id>" },
  "tracingId": "<uuid>",
}
```

**UNVERIFIED** (no live capture): that the echo keeps `metadata.parentMessageId` and the `ButtonResponse` unchanged. The SDK assumes it does: its consumed logic reads `metadata.parentMessageId` from the received inbound message.

The reply, formatted: `contentType: "datepicker"`, `messageType: "inbound"`, `text: buttonResponse.text`, `payload: <ISO dateTime>`, `imageUrl: ""`, `parentMessageId` (only when the raw message had `metadata.parentMessageId`), and `datePicker: {}`.

## List picker

### Received (raw)

`contentType: "ListPicker"`, property `listPicker`, schema `ConversationContentListPicker` (no field is marked required):

| Field             | Type                                            | Notes                                                                                                                  |
| ----------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `id`              | string                                          | "Optional unique identifier to help map component replies to form messages where multiple ListPickers can be present." |
| `sections`        | array of `ConversationContentListPickerSection` | `{ title, multipleSelection: boolean, items: [ConversationContentListPickerItem] }`                                    |
| `receivedMessage` | `ConversationContentReceivedReplyMessage`       | "The message prompt to select options"                                                                                 |
| `replyMessage`    | `ConversationContentReceivedReplyMessage`       | "The reply message after the user has selected the options"                                                            |

`ConversationContentListPickerItem`: `{ id, title, subtitle, imageUrl }`. `ConversationContentReceivedReplyMessage`: `{ header, title, subtitle, buttonLabel, imageUrl }`.

### Formatted

`contentType: "listpicker"`, `listPicker: { id: <raw message id>, ...rawListPicker }` (the raw `listPicker.id`, if any, is **overwritten** by the message id), plus top-level `state`/`updatedTime` when set.

### How Genesys' UI renders it

- In the transcript: a card built from **`receivedMessage`**: `title`, `subtitle` (as description) and `imageUrl`. No card when `receivedMessage.title` is empty. The button reads i18n `getStartedButton`, or `viewSelectionButton` when `state === "consumed"` (search `viewSelectionButton`). The panel header is `receivedMessage.title`.
- **`header` and `buttonLabel` are not used anywhere** in the bundle (no `buttonLabel` string).
- Sections render in order with their `title`. `multipleSelection: false` behaves like radio buttons: one item per section, choosing another replaces it, choosing the same one does nothing (no deselect). `multipleSelection: true` toggles checkboxes.
- The send button (i18n `inputSendTextButton`, or `doneTextButton` once submitted) is enabled when **at least one item in any section** is selected. No section is required.
- Submit (search `Sending selected list picker options`):

```js
r({
  type: 'listPicker',
  postback: {
    id: a /* message id */,
    text: o /* replyMessage.subtitle || "" */,
    selectedOptions: e,
  },
});
// e: one { text: item.title, payload: item.id } per selected item; single-selection sections first, then multiple-selection items in click order
```

- After the reply arrives, the inbound reply renders as a "submitted" bubble with the reply `text` and `replyMessage.imageUrl` of the original, plus the list in read-only mode with the selections from the reply's formatted `payload`.

### Reply

Documented command (verbatim):

```js
Genesys("command", "MessagingService.sendMessage", {
  type: "listPicker", //Mandatory field specifying the list picker message type
  postback: {
     id: "<outbound message id>", // Mandatory field
     text: "<replyMessage.subtitle property from the outbound message>",  // Mandatory field
     selectedOptions: [  // Mandatory field, at least one
         {
            text: "<selected option 'title' from the outbound message>",
            payload: "<selected option 'id' from the outbound message>"
         },
         ...
     ]
    }
  },
  function() { /*fulfilled callback*/ },
  function() { /*rejected callback*/ }
);
```

What the transport builds (search `case"listPicker"`):

```jsonc
{
  "type": "Structured",
  "text": "<postback.text, not truncated; absent if undefined>",
  "content": [
    // one per selectedOptions entry, in order; [] if selectedOptions is missing
    {
      "contentType": "ButtonResponse",
      "buttonResponse": {
        "originatingMessageId": "<postback.id>",
        "payload": "<option.payload>",
        "text": "<option.text>",
        "type": "ListPicker",
      },
    },
  ],
  "metadata": { "id": "<uuid>", "parentMessageId": "<postback.id, only if set>" },
  "tracingId": "<uuid>",
}
```

Nothing enforces "at least one": an empty `selectedOptions` sends `content: []`. That rule is yours to keep.

The reply, formatted: `contentType: "listpicker"`, `messageType: "inbound"`, `text`, `payload: [<raw buttonResponse>, ...]` (each `{ type, text, payload, originatingMessageId }`), `parentMessageId` when `metadata.parentMessageId` was present, and no `listPicker`.

## Form

### Received (raw)

`contentType: "Form"`, property `form`, schema `ConversationContentForm` (required: `cannedResponseId`):

| Field                             | Type                                         | Notes                                                                    |
| --------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| `introduction`                    | `ConversationContentIntroduction`            | `{ title*, subtitle, imageUrl, buttonText* }` (`*` required)             |
| `formPages`                       | array of `ConversationFormPage`              | `{ title*, subtitle*, pageComponents: [ConversationFormPageComponent] }` |
| `receivedMessage`, `replyMessage` | `ConversationContentReceivedReplyMessage`    | as for list picker                                                       |
| `showSummary`                     | boolean                                      | "Show summary at end of form submission."                                |
| `cannedResponseId`                | string, **required**                         | must be echoed in the reply                                              |
| `response`                        | array of `ConversationFormResponseComponent` | only on the **reply**                                                    |
| `originatingMessageId`            | string                                       | only on the **reply**                                                    |

`ConversationFormPageComponent`: `formComponentType: "ListPicker" | "DatePicker" | "WheelPicker" | "Input"` and the matching property:

| `formComponentType` | Property and schema                             | Fields                                                                                                                                                                                                                                                                                                        |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Input`             | `input`: `ConversationContentInput`             | `id`, `title`, `subtitle`, `placeholderText`, `isRequired`_, `isMultipleLine`_, `keyboardType` (`Default`, `NumberPunctuation`, `Number`, `Phone`, `Email`, `Decimal`, `Websearch`, `URL`), `autoCompleteType` (`Prefix`, `Name`, `GivenName`, ... `Birthdate`, `DateTime`, `FlightNumber`, `Url`; 38 values) |
| `DatePicker`        | `datePicker`: `ConversationContentDatePicker`   | `id`, `title`, `subtitle`, `imageUrl`, `dateMinimum`, `dateMaximum`, `location` (`{ url, address, text, latitude, longitude }`), `availableTimes`, `dateDisplayFormat` (`dayMonthYear`, `monthDayYear`, `yearMonthDay`)                                                                                       |
| `ListPicker`        | `listPicker`: `ConversationContentListPicker`   | as above; `id` identifies the component                                                                                                                                                                                                                                                                       |
| `WheelPicker`       | `wheelPicker`: `ConversationContentWheelPicker` | `id`, `items`* : `[{ id*, title*, value }]`                                                                                                                                                                                                                                                                   |

The `id` fields are all optional in the schema, but a reply can only be keyed by them; Genesys' UI requires them (PropTypes `id: string.isRequired`).

### Formatted

`contentType: "form"`, `form: { id: <raw message id>, ...rawForm }`, plus top-level `state`/`updatedTime`. The reply formats the same way: `form: { id, originatingMessageId, cannedResponseId, response }`, `messageType: "inbound"`. Tell them apart by `messageType` or by `formPages` vs `response`.

### How Genesys' UI renders it

- In the transcript: a card from `receivedMessage` (`title`, `subtitle`, `imageUrl`), button `getStartedButton`, or `viewAnswersButton` when `state === "consumed"`.
- Pages (search `pageId:"introduction"`): `[introduction?]`, then one page per `formPages` entry (title, subtitle, components), then a `summary` page if `showSummary`. Back is hidden on the first page, Next on the last; Send (i18n `sendButton`) is on the last page, which is the summary when there is one. The introduction page shows `title`, `subtitle`, `imageUrl` and a `buttonText` button that moves on.
- Validation gates **Next and Send** for the current page only; when blocked, focus moves to the first `[aria-invalid="true"]` field. A page is valid when every component is valid:
  - `Input` with `isRequired: true`: value trimmed is non-empty. Otherwise always valid. There is **no format check** for `Email`, `Phone`, `URL` etc.; `keyboardType` only sets the HTML `type`/`inputMode` (`Number`→`numeric`, `Phone`→`tel`, `Email`→`email`, `Decimal`→`decimal`, `Websearch`→`search`, `URL`→`url`, else `text`; `NumberPunctuation` falls to `text`), and `autoCompleteType` maps to the HTML `autocomplete` token (`GivenName`→`given-name`, `PaymentCardNumber`→`cc-number`, ..., unknown→`off`). `maxLength` is **30** for single-line and **300** for multi-line inputs (constants in `main.min.js` module `10427`).
  - `DatePicker`: **always required**, whatever the schema says. It is a calendar date field (not time slots) bounded by `dateMinimum`/`dateMaximum`, displayed in `dateDisplayFormat` (`DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY/MM/DD`; default `MM/DD/YYYY`).
  - `ListPicker` and `WheelPicker`: never required (their schemas have no `isRequired`).
- The summary page lists each answered component: label is the component `title` (or the page title), value is the text, `"—"` when empty, list picker values joined with `", "`.
- When consumed, "View answers" opens a read-only summary built from the reply's `form.response` (search `bConsumed:!0`), labelled by component id → title from the original `formPages`.

### Reply

Documented command (verbatim):

```js
Genesys(
  'command',
  'MessagingService.sendMessage',
  {
    type: 'form', // Mandatory field specifying the form message type
    postback: {
      id: '<outbound message id>', // Used to correlate the response with the outbound Form message
      text: '<replyMessage.title property from the outbound message>', // Mandatory field
      cannedResponseId: '<cannedResponseId from the outbound message>', // Mandatory field
      formData: [
        {
          id: '<form field id>',
          text: '<submitted value for the form field>', // For datePicker use the Format received in the outbound Form Message, otherwise use the appropriate text value here
          payload: '<submitted value payload>', // For listPicker use the individual option id here, for datePicker use (ISO 8601) date format
        },
      ],
    },
  },
  function () {
    /* fulfilled callback */
  },
  function () {
    /* rejected callback */
  },
);
```

Rules (verbatim summary): datePicker responses inside a form are required. Text inputs are required only if `isRequired`. listPicker and wheelPicker responses should be returned, but empty text/payload is accepted.

What Genesys' UI puts in `formData` (search `type:"form",postback:`):

| Component     | `formData` entries                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Input`       | `{ id, text: value, payload: value }`. **Only if the user typed in it**; an untouched optional input is omitted                                                                |
| `DatePicker`  | `{ id, text: date formatted with dateDisplayFormat, payload: "YYYY-MM-DDT00:00:00.000Z" }` (UTC midnight of the chosen day: `dayjs.utc(d.format("YYYY-MM-DD")).toISOString()`) |
| `ListPicker`  | one `{ id, text: item.title, payload: item.id }` **per selected item**, all with the component `id`; `{ id, text: "", payload: "" }` when none (it registers `[]` on mount)    |
| `WheelPicker` | `{ id, text: item.title \|\| item.value \|\| item.id, payload: item.id }`, or `{ id, text: "", payload: "" }` (it registers `""` on mount)                                     |

`postback.text` is `replyMessage.title || ""`, `cannedResponseId` is the outbound's `cannedResponseId || ""`, `postback.id` is the message id.

What the transport builds (search `case"form"`):

```jsonc
{
  "type": "Structured",
  "text": "<postback.text || ''>",
  "content": [
    {
      "contentType": "Form",
      "form": {
        "originatingMessageId": "<postback.id>",
        "cannedResponseId": "<postback.cannedResponseId || ''>",
        "response": [
          {
            "id": "<formData.id>",
            "component": {
              "contentType": "ButtonResponse",
              "buttonResponse": {
                "type": "Form",
                "text": "<formData.text>",
                "payload": "<formData.payload>",
              },
            },
          },
        ],
      },
    },
  ],
  "metadata": { "id": "<uuid>" }, // no parentMessageId for forms
  "tracingId": "<uuid>",
}
```

`content` is `[]` when `formData` is not an array; the frame is still sent. The link to the form is `form.originatingMessageId`, not metadata.

## `repliedMessage` payloads

`MessagingService.repliedMessage` is published when the **inbound echo** of a reply arrives and the original was found in the SDK's list of messages (search `onRepliedMessage`). The plugin normalises `type` to `"datePicker"`, `"listPicker"` or `"form"`. `id` is the reply's raw `id`; `metadata` is the reply's **whole** raw `metadata`.

```jsonc
// datePicker: only when buttonResponse.payload is set
{ "id": "<reply id>", "type": "datePicker", "metadata": { "id": "...", "parentMessageId": "<outbound id>" },
  "scheduledTime": "<buttonResponse.payload>", "scheduledMessage": "<buttonResponse.text>" }

// listPicker: one entry per ButtonResponse with a payload
{ "id": "<reply id>", "type": "listPicker", "metadata": { "parentMessageId": "<outbound id>", ... },
  "text": "<reply text, if any>", "payload": [ { "text": "<option title>", "id": "<option id>" } ] }

// form: only when form.originatingMessageId is set
{ "id": "<reply id>", "type": "form", "metadata": { ... }, "originatingMessageId": "<outbound Form id>",
  "text": "<reply text || ''>",
  "response": [ { "id": "<component id>", "component": { "contentType": "ButtonResponse",
      "buttonResponse": { "type": "Form", "text": "<value>", "payload": "<value>" } } } ] }
```

For a date or list picker, `repliedMessage` fires only when `metadata.parentMessageId` matches a message the SDK has formatted in this page session; for a form, `form.originatingMessageId` must match. Each reply also publishes `messagesUpdated { updatedMessages }` with a copy of the original marked `state: "consumed"` (an empty array when the original was not found, for pickers).

## Recognising an answered picker or form

The SDK's `state: "consumed"` is **page-session memory, not server state**. It is set:

- live: on the original's copy in `messagesUpdated`, and on the raw reply itself before `messagesReceived` (so the reply, not the picker, carries `state` in `messagesReceived`);
- in history: on an outbound picker/form when a reply referencing it was formatted **earlier** in the same page session (search `"datepicker"===s||"listpicker"`). That works for replies on the same or a newer history page only if pages are processed newest-first (see [sdk-source-notes.md](./sdk-source-notes.md#history-order-and-overlap)), and only if the history entity carries `metadata.parentMessageId` or `form.originatingMessageId`. **UNVERIFIED** whether `GET /api/v2/webmessaging/messages` returns `metadata` at all.

So do not trust `state` alone. Decide "answered" yourself: an outbound picker/form with id `X` is answered when any inbound message references `X`.

| Shape                                 | Date picker reply                                          | List picker reply                                                                                      | Form reply                                                     |
| ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Raw (`messagesReceived`)              | `metadata.parentMessageId === X`                           | `metadata.parentMessageId === X`, or any `content[].buttonResponse.originatingMessageId === X`         | `content[].form.originatingMessageId === X`                    |
| Formatted (`restored`, `oldMessages`) | `contentType === "datepicker"` and `parentMessageId === X` | `contentType === "listpicker"` and (`parentMessageId === X` or `payload[].originatingMessageId === X`) | `contentType === "form"` and `form.originatingMessageId === X` |

Also treat `state === "consumed"` on the outbound as answered. Ids: outbound bot messages have no `channel.messageId`, so the raw `id` and the formatted `id` are the same value ([sdk-source-notes.md](./sdk-source-notes.md#observed-in-a-live-session-2026-10-01)); send that as `postback.id`. A reply sent without `postback.id` cannot be linked, by the SDK or by you.

**UNVERIFIED:** the reply's echo and history entity keep `metadata.parentMessageId`, `buttonResponse.originatingMessageId` and `form.originatingMessageId` as sent. The SDK's own consumed logic depends on the first and the last, which suggests the server keeps them.

## Rendering checklist

- Render `text` (if any), then each `content[]` item by `contentType`. Ignore unknown types rather than throwing.
- Markdown: the config has `messenger.apps.conversations.markdown` (Platform API `ConversationAppSettings.markdown`). **UNVERIFIED:** which markdown subset agents and bots may send. Always treat text as untrusted and escape or sanitize it. Never inject it as HTML.
- Card and carousel URLs and images come from bot or agent content. Validate the scheme (`https:`) before using them.
