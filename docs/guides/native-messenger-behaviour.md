# How the native Messenger window behaves

This guide covers how Genesys' own (non-headless) Messenger behaves around its window: the launcher, open state, unread signalling, header actions, the home screen, starting and ending a conversation, and its default English strings. A headless UI can copy this behaviour. For how it looks, see the separate UI guide.

Everything was read on **2026-10-02**. The sources were:

- **Published scripts** from `https://apps.mypurecloud.com/messenger/`: `main.min.js` (the launcher frame: launcher, Toaster, open/close; ETag `20863262daf7fee078a0508f4bb7b995`), `messenger.min.js` (the conversation, home and header views; ETag `37a50c9249e6a43b26fe521293dcc01a`), and `i18n/en-us.json` (the English labels; ETag `f0b07d21114dbbd0cfab67766e453edd`), and `main.css` (ETag `7d0e76611c9bc2ffdef6ec18c9f23f53`). Also read was `https://apps.mypurecloud.com/genesys-bootstrap/genesys.min.js` 2.14.0 (the host-page iframe CSS). All were Last-Modified 2026-09-07. `messenger.html` loads `main.min.js`, and `main.min.js` loads its labels with `Genesys("loadJSON", `./i18n/${lang}.json`)`. The files were minified, so they were formatted for reading. Search strings below are exact text in the minified files.
- **Developer Center** pages (Markdown source): [launcherPlugin](https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/launcherPlugin), [messengerPlugin](https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messengerPlugin), [toasterPlugin](https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/toasterPlugin), [localStorage](https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/localStorage).
- **Resource Center**: [Configure Messenger](https://help.genesys.cloud/articles/configure-messenger/).

These are Genesys' current builds, not a contract.

## Launcher

- **A click toggles the window.** `handleLauncherClick` calls `toggleLauncher()`, which flips `expandLauncher` and calls `Messenger.open` or `Messenger.close` (`main.min.js`, search `handleLauncherClick`).
- **The launcher stays on screen while the window is open, but changes.** While open it becomes a circular button showing a "expand more" (down chevron) icon (`className:"mxg-expand-more-icon"`). It has `aria-expanded=true`, and its `aria-label` and `title` are `launcher.ariaMinimizeButton`, "Minimize Assistance panel". While closed it shows the icon, the text, or both, depending on `launcherButton.displayType` (`Icon` / `Text` / `IconAndText`; anything else falls back to `Icon`). Its label is then "`<buttonText>` - Open Assistance panel", or just "Open Assistance panel" when the display type is Icon only.
- **Launcher text** is `launcher.buttonText`, which defaults to "Message Us". It is truncated to 20 characters in code (`substring(0,20)`) and documented as limited to 20 characters (Configure Messenger).
- **On phones and tablets** with IconAndText, the launcher collapses to the icon when the page scrolls down more than 10px and expands again when it scrolls up (`bScrollCollapsed`).
- **Native launcher in headless mode.** It does not render (the render guard is `!$&&J`, where `$` is `headlessMode.enabled`). `showLauncher` is also a no-op when headless. Confirmed from source; this answers the UNVERIFIED point in [other-plugins.md](./other-plugins.md).

### Visibility modes

Config `launcherButton.visibility` is lower-cased in code to `on` / `off` / `ondemand`. The Resource Center labels are "Show (default)", "Hide", and "Hide until triggered by business logic".

| Mode       | Behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Source                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `On`       | Always visible. Publishes `Launcher.visible` on ready. `Launcher.show` and `Launcher.hide` reject with "Invalid configuration of Launcher button".                                                                                                                                                                                                                                                                                                                                                                                                                                     | Docs + `main.min.js` (`registerCommand("show"`)                                                             |
| `Off`      | Never visible. _"Use Always hide if you build your own custom Messenger."_ The page opens Messenger itself with `Messenger.open`.                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Configure Messenger                                                                                         |
| `OnDemand` | Hidden at first. Shown by `Launcher.show`, and also shown automatically when `Messenger.open` runs, when a Toaster opens, when a Predictive Engagement invite shows, and on `MessagingService.restored`. Hidden again on `MessagingService.conversationCleared` and `MessagingService.sessionExpired` (`hideLauncherOnDemand`). The docs say: _"After this button triggers, the launcher remains visible while the conversation is active."_ `Launcher.show` resolves silently when the launcher is already visible. `Launcher.hide` rejects with "Launcher button is already hidden". | Configure Messenger; `main.min.js` (search `hideLauncherOnDemand`, `getSnapshotBeforeUpdate`, `"ondemand"`) |

Code differs from docs on one point: in code, `Launcher.hide` is also allowed when authentication is enabled, not only for OnDemand. The docs say OnDemand only.

## Open state: persisted, and restored with the conversation

- **Key:** `_{deploymentId}:gcmcopn`, documented as _"Keeps track of the state of the Messenger window. No expiration."_ (localStorage page). In code it is `messengerStorage + subOpenStorage`, which is `<deploymentId>:gcmc` + `opn`. The value is the string `"true"` or `"false"`.
- **Written** as `"true"` on launcher-open and `Messenger.open`. Written as `"false"` on launcher-minimise, `Messenger.close`, header minimise, and logout. **Removed** on `Messenger.clear` (`setMessengerCleared`).
- **Read back:** on page load, the conversations view checks it when a previous active conversation is being restored. It reacts to status transitions such as `restoring`→`restored` and `connected`→`restored`. If the value is `"true"` and the window is not open, it calls `toggleLauncher()` and routes to `conversations.conversations` (`messenger.min.js`, search `this.bActivePrevConv=!1`). So the window **reopens on reload or navigation only if it was open and there is a conversation to restore**. With no conversation, it starts closed.

## Unread messages while minimised

The current web build has **no unread badge, no count, no sound, no title flash, and no browser notification**. Measured by searching all three UI bundles. The following appear in none of them: `unread`, `Badge`/`badgeContent`, `new Notification`/`requestPermission`, `document.title`, `new Audio`/`.play()`. The labels `conversations.notificationTitle` ("You have a new message.") and `notificationBody` ("You have one or more unread messages.") exist in `en-us.json`, but no web bundle references them. **Inferred:** they belong to the Configure Messenger "Notifications" setting, which _"sends a single notification while the user is offline"_. That reads like Mobile Messenger push. **UNVERIFIED** that this setting has no web effect.

The **Toaster** is not an unread preview. It opens only through `Toaster.open` with brand-supplied `title`/`body` and buttons (defaults "Accept"/"Decline"), one at a time, and stays until accepted, declined or closed (toasterPlugin docs; `main.min.js` `handleToasterOpen`). With OnDemand visibility, opening a Toaster also shows the launcher.

## Header controls

The header buttons, from `messenger.min.js` (search `ariaMinimize`, `messenger-menu`, `ariaDeleteTitle`):

- **Minimise** (`conversations.ariaMinimizeButton`, "Minimize Assistance panel"). It appears **only when the launcher is hidden or the window is full screen or a tablet in landscape** (`(Dt||!S)`). On a desktop with the launcher visible there is no header minimise button; the launcher chevron minimises. Clicking it collapses the window.
- **Clear (bin icon)**. Shown when `conversationClear.enabled`, the route allows it, and there is at least one message. Label and tooltip: `ariaActionsClearButtonTitle`, "Clear and leave your conversation". Clicking it opens a confirmation dialog:
  - message `alert.confirmClearConversation`: "Would you like to clear and leave your conversation? Message history will be lost."
  - primary `sureButton`: "Yes, I'm Sure"
  - secondary `cancelButton`: "Cancel". Cancel returns focus to the bin button.
- **Overflow menu** ("more" icon, `aria-label` `home.ariaExpandMenu` "Expand menu", tooltip `ariaMenuTitle` "Conversation menu", `aria-haspopup`, menu id `messenger-menu`). It exists **only with authentication**. It shows when signed in (name and initials, then Clear), or when both Clear and step-up Sign-in apply in compact mode. Its items are "Sign-in" and "Clear" (`clearButton`; `aria-label` "Clear the conversation button").
- **Back** (`ariaBackButton` "Back"). Shown on the conversation route when Home, Knowledge or co-browse is enabled; it returns to Home.
- **After the customer confirms Clear, the window closes.** On `MessagingService.conversationCleared`, the following happens:
  - The alert closes.
  - The conversation view sets `bCleared`.
  - The view calls `closeMessenger(true)`, which writes `gcmcopn` = `"false"`.
  - If Home, Knowledge or co-browse is enabled, the route is reset to Home first (`dispatch(qe())`), so the next open lands on Home.
  - The reducer `CONVERSATIONCLEARED` empties `messages` and sets `status: "cleared"`.
  - Focus moves to the launcher (`previousConversationCleared && ... launcherBtnRef.current.focus()`).
  - With OnDemand visibility, the launcher also hides.

  Sources: `messenger.min.js`, search `this.bCleared=!0`, `case"CONVERSATIONCLEARED"`, `this.props.closeMessenger(!0)`; `main.min.js`, search `hideLauncherOnDemand`.

- **No "End conversation", no transcript download, no close (X)** on the conversation route. The route table entry for `"conversations.conversations"` is `{deleteButton:!0, closeButton:!1, backButton:!0, moreVertButton:!0, ...}`. `transcript` appears only as internal ref names. The only end-user way to leave is Clear.

## Home screen

- Home shows when it is enabled in the configuration ("Messenger Homescreen"), and it is forced on when Knowledge or co-browse for voice is enabled (Configure Messenger: _"If Voice is enabled, Homescreen is enabled"_). The launcher opens to `conversations.home` in that case. Without Home, it opens straight to the conversation.
- Header: logo (`homeScreen.logoUrl`, _"appears in the home screen header"_), `home.headerTitle` "Welcome", `home.headerSubTitle` "We're here to help".
- Conversation card (search `conversation-card-title`):
  - No messages yet: title "Start a conversation", button "Message us".
  - Has messages: title "Continue the conversation", button "Continue", plus a preview of the last message with its time and agent avatar.
  - Disconnected and read-only (`conversationDisconnect.enabled`, `readOnly`): title "Your conversation", button "Open", plus a secondary button "Start new".
  - A bin button appears when Clear is enabled and there are messages.
- With Knowledge enabled, the search box shows "What are you looking for?" / "Search for a topic..." (`knowledge.*`).
- **For headless with Home on:** nothing renders for you. Native UI suppresses all of this when headless. **Inferred:** a faithful copy would show a home view with the card above, and route the card button to the conversation.

## Starting a conversation

- Configure Messenger: _"select whether conversations start automatically when the user expands the Messenger window ... When this feature is off, conversations start when the user sends the first message."_
- There is no Start button in the conversation view. The "starter" is a **system message** (`{messageType:"system", ...}`, rendered as centred caption text in `.mxg-system`). It is prepended to the top of the transcript.
  - Text: `startConversationMessage`, "This is the beginning of your conversation with us. Please send a message to get started.", or `autoStartConversationMessage`, "This is the beginning of your conversation with us.", when `bAutoStartEnabled`. A deployment-supplied `updatedStarterMessage` is appended on a new line.
  - It is **not an empty-state placeholder**. It marks the start of the conversation: it shows when history is complete (`historyComplete`, `sessionCleared`), or when the first page holds fewer messages than a page. It stays above the messages once they arrive. It is hidden while an older history page might still exist (`historyFetched`, `restored`).
  - Source: `messenger.min.js`, search `messageType:"system",text:` and `bStarterMessage`.
- With Home on, "Message us" on the Home card is effectively the start button. It navigates to the conversation; whether the conversation starts then depends on autoStart.

## Disconnected / ended conversation

Only when `conversationDisconnect.enabled` (search `mxg-disconnect-message`, `startNewConversation_text`):

- **Placement:** the block sits **inline in the transcript**, not in a fixed bar. It is rendered directly after the `Presence`/`Disconnect` event it describes (`He&&i.createElement(wr,{dateTime:...format("LLL")...})` inside the message map), so it scrolls with the messages. Only the "Start new" button (ReadOnly type) is fixed, in the input area at the bottom.
- A status block (`role="status"`, `aria-live="polite"`) shows `disconnectMessage`, "Your conversation has ended". When the type is `Send` (not read-only), it adds `disconnectMessageSend`, "Resume conversation by sending a new message", and then the date and time. An assertive screen-reader alert reads the same text once.
- Type `ReadOnly`: the input is replaced by a **"Start new"** button (`startNewConversation`). The button receives focus with a composed `aria-label` ("Your conversation has ended. … <date>. Start new"), which is removed on blur. Clicking it dispatches `RESETCONVERSATION`, which is the native path to `MessagingService.resetConversation`. Read-only error label: `ariaReadOnlyError`, "Session is read-only, no new messages allowed."
- Type `Send`: there is no button; the user just types.

## Keyboard and focus

- When the window is closed with the keyboard on the launcher (`keypress`), focus returns to the launcher, if the launcher is visible (`toggleLauncher`, `i.current.focus()`).
- Shift+Tab from the launcher wraps into the open Knowledge view (`handleLauncherKeyDown`).
- Header buttons activate on Enter or Space (`13`/`32`).
- On mobile, the window container gets `aria-modal`, and a Tab-key trap is registered (`handleTabKey` on `keydown`).
- The Home card autofocuses its primary button.
- **Escape does not close or minimise the window.** The only `"Escape"` handler in `main.min.js` and `messenger.min.js` belongs to the structured **form** overlay. There it closes the form, after the "Your entered information won't be saved if you leave." abandonment prompt if anything was entered. Neither file has a `27` keyCode check.
- **Focus on open:**
  - **Conversation view:** the message input autofocuses (`autoFocus: !u || !!na`, where `u` is admin preview mode). Focus also returns to the input 260 ms after an overlay such as a file preview or picker closes. It does not return after Clear.
  - **Home:** the card list autofocuses one card. The Toaster card wins if a Toaster is open; otherwise the Conversation card's primary button ("Message us" / "Continue" / "Open"). Search `autoFocus:W.cardType===`.

## Timestamps and delivery status

- **Without humanize, no time is visible under bubbles.** Each bubble has a hover/focus tooltip showing the time (`enterDelay: 500`, `title: time`, placed `right-start` for customer messages and `left-start` for others). With humanize on, a caption row "Name · time" shows under the bubble when the name is shown.
- **Date dividers** appear between messages from different days (`oDateDivider`).
- **"Sent"** (`ariaMessageSent`) shows only under the **last customer (inbound) message**, and only once its `deliveryStatus` is `"sent"`. The code computes `ce` = last index of an inbound non-event message, and passes `bSentMessage` only when `t===ce`.
- **"Sending"** (`ariaMessageSending`) shows under any message still in `sending`.
- **Failed messages** (`deliveryStatus: "error"`) get an error icon whose tooltip is "Failed to send, please type again.", or the length-exceeded or read-only text.
- Source: `messenger.min.js`, search `t===ce&&me&&"sent"===me`, `case"sent":W=!0`.

## Mobile

- The **host page** controls full screen. `genesys.min.js` injects CSS for the two iframes. Under `@media screen and (max-width: 600px)`, `(max-device-width: 600px)`, `(max-device-width: 711px) and (orientation: landscape)` and `(max-device-height: 428px) and (orientation: landscape)`, the `.genesys-mxg-conversation` and `.genesys-mxg-homescreen` frames become `height:100%; width:100%; left/right/bottom:0`. That is full screen for both the conversation and Home. On desktop the frame is `max-height: 712px` (92% when expanded). Inside the iframe, `main.css` matches with `.cx-messenger-container{height:100%;width:100%}` under the same device-width breakpoints. A `fullScreen` config flag applies `mxg-fullscreen` / `.genesys-mxg-frame-fullscreen` at any size.
- **What closes it there:** the header **minimise** button. The header measures the frame; when its bottom is `0px` (full screen), it sets the state that shows minimise (`t&&"0px"===t?B||H(!0)`, then `B&&(Dt=!0)`). The same happens for the `fullScreen` flag and tablet landscape. There is no Escape and no close (X).
- On mobile the window container also gets `aria-modal` and a Tab trap (`handleTabKey`).
- **Inferred:** the full-screen frame covers the launcher. Both frames share `z-index: 99999999`; the stacking was not measured.

## Default English labels (`i18n/en-us.json`)

Selected labels relevant to a window UI. Keys are as Genesys spells them; deployments can override them per language with "Edit Labels", served from `{customLabelUrl}/{deploymentId}/{lang}.json` (`genesys.min.js`, `getCustomLabels`).

| Key                                                                               | Text                                                                                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `launcher.buttonText`                                                             | Message Us                                                                                                 |
| `launcher.ariaOpenButton`                                                         | Open Assistance panel                                                                                      |
| `launcher.ariaMinimizeButton`                                                     | Minimize Assistance panel                                                                                  |
| `conversations.headerTitle`                                                       | Message Us                                                                                                 |
| `conversations.inputMessagePlaceholder`                                           | Send a message...                                                                                          |
| `conversations.typeMessagePlaceholder`                                            | Type your message here                                                                                     |
| `conversations.inputMessageTitle`                                                 | Message input field                                                                                        |
| `conversations.ariaSendButton`                                                    | Send your message                                                                                          |
| `conversations.ariaAttachButton`                                                  | Attach file                                                                                                |
| `conversations.ariaRemoveButton`                                                  | Remove file                                                                                                |
| `conversations.ariaMinimizeButton`                                                | Minimize Assistance panel                                                                                  |
| `conversations.ariaMessengerOpenStatus` / `...MinimizeStatus`                     | Messenger is opened / Messenger is minimized                                                               |
| `conversations.ariaMenuTitle`                                                     | Conversation menu                                                                                          |
| `conversations.clearButton`                                                       | Clear                                                                                                      |
| `conversations.ariaActionsClearButtonTitle`                                       | Clear and leave your conversation                                                                          |
| `conversations.alert.confirmClearConversation`                                    | Would you like to clear and leave your conversation? Message history will be lost.                         |
| `conversations.sureButton` / `cancelButton`                                       | Yes, I'm Sure / Cancel                                                                                     |
| `conversations.startConversationMessage`                                          | This is the beginning of your conversation with us. Please send a message to get started.                  |
| `conversations.autoStartConversationMessage`                                      | This is the beginning of your conversation with us.                                                        |
| `conversations.disconnectMessage`                                                 | Your conversation has ended                                                                                |
| `conversations.disconnectMessageSend`                                             | Resume conversation by sending a new message                                                               |
| `conversations.startNewConversation`                                              | Start new                                                                                                  |
| `conversations.ariaStartNewConversation`                                          | Start new conversation                                                                                     |
| `conversations.ariaReadOnlyError`                                                 | Session is read-only, no new messages allowed.                                                             |
| `conversations.ariaIsTyping` / `ariaStopTyping`                                   | Typing in progress / Typing has stopped                                                                    |
| `conversations.ariaNewMessage`                                                    | New message                                                                                                |
| `conversations.agentDefaultName` / `botDefaultName` / `customerDefaultName`       | Agent / Bot / You                                                                                          |
| `conversations.ariaMessageSending` / `Sent` / `NotSent`                           | Sending / Sent / Not sent                                                                                  |
| `conversations.ariaSendMsgError`                                                  | Failed to send message                                                                                     |
| `conversations.sessionExpirationWarningMessage`                                   | Please note that the session will expire after <%sessionMinutes%> minutes of inactivity.                   |
| `conversations.errors.startFailed`                                                | We are unable to start a conversation. Please try again later.                                             |
| `conversations.errors.restoreFailed`                                              | We're sorry, but we are unable to restore your conversation.                                               |
| `conversations.errors.disconnected` / `reconnecting`                              | Connection lost / Reconnecting...                                                                          |
| `conversations.errors.reconnect`                                                  | RECONNECT                                                                                                  |
| `conversations.errors.connectionRestored`                                         | Connection was successfully restored.                                                                      |
| `conversations.errors.generic`                                                    | We apologize but something unexpected happened. Please try again later.                                    |
| `conversations.errors.fileTooLarge`                                               | We're sorry but the file size is too large. Please retry with file size not exceeding <%maxFileSizeLimit%> |
| `conversations.errors.fileTypeInvalid`                                            | We're sorry but only <%allowedFileTypes%> file types are supported.                                        |
| `conversations.errors.messageLengthExceeded`                                      | Message length is larger than <%maxMessageLength%>.                                                        |
| `home.headerTitle` / `headerSubTitle`                                             | Welcome / We're here to help                                                                               |
| `conversations.startConversationCardTitle` / `startConversationButtonTitle`       | Start a conversation / Message us                                                                          |
| `conversations.continueConversationCardTitle` / `continueConversationButtonTitle` | Continue the conversation / Continue                                                                       |

The full file has about 260 keys. Fetch it with a GET to `https://apps.mypurecloud.com/messenger/i18n/en-us.json`. Note that `en.json` returns 404; the file name is the full locale.
