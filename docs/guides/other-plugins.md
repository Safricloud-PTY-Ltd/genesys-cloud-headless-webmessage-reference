# Other plugins relevant to headless mode

This guide covers only what matters for a custom chat UI. The full list of plugins is Auth, AuthProvider, CobrowseService, CobrowseVoice, Conversations, Database, Engagement, Journey, Knowledge, KnowledgeService, Launcher, MessagingService, Messenger and Toaster.
Index source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/

## Database: custom attributes

Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/databasePlugin and https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/pluginExamples#define-and-send-custom-attributes

Custom attributes set in Database are attached **automatically to the next inbound message**. You can use them in Architect (Get Participant Data) and agent scripts.

| Command           | Options                                                                    | Behaviour                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Database.set`    | `{ messaging: { customAttributes: {...} } }`                               | Sets the attributes. If `customAttributes` already exists, it does a **shallow** merge. Publishes `Database.updated`               |
| `Database.update` | same                                                                       | **Deep** merge. Publishes `Database.updated`                                                                                       |
| `Database.get`    | `{ name: "messaging.customAttributes" }` (omit `name` to get the whole DB) | Resolves with the value                                                                                                            |
| `Database.remove` | `{ name: "messaging.customAttributes" }`                                   | Local removal only. _"Data already sent on an inbound message is not removed from the conversation."_ Publishes `Database.removed` |

| Event              | Data                    |
| ------------------ | ----------------------- |
| `Database.ready`   | none                    |
| `Database.updated` | updated database object |
| `Database.removed` | updated database object |

```js
Genesys('command', 'Database.set', {
  messaging: {
    customAttributes: {
      department: 'sales',
      property_type: 'apartment',
      device: 'mobile',
    },
  },
});
```

Limit: _"The customAttributes object must be less than 2KB in total size for a single message. If the 2KB limit is exceeded, the inbound message will fail to send."_ (`metadata.custom.attributes.bytes.max` = 2048). The SDK publishes `MessagingService.customAttributesSizeExceeded` when this happens.

**UNVERIFIED:** whether attributes set before the first message also ride on the JOIN event sent by `startConversation`/`joinConversation` under autoStart. The Guest API JOIN example does carry `channel.metadata.customAttributes`, but the SDK docs only say "the next inbound web message".

## Auth / AuthProvider (authenticated messaging)

Sources:

- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/authPlugin
- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/authProviderPlugin
- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/authenticatedMessenger

Authenticated messaging needs an OpenID Connect Messenger Configuration integration, and **Authentication** enabled in the Messenger configuration (https://help.genesys.cloud/articles/configure-messenger/). You write an `AuthProvider` plugin. Messenger's `Auth` plugin calls it to get an auth code, then exchanges the code for a JWT.

**AuthProvider: commands you implement** (via `registerCommand`)

| Command                   | Must resolve with                                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getAuthCode` (mandatory) | `{ authCode \| idToken, redirectUri, codeVerifier? (PKCE), nonce?/maxAge? (Okta) }`. Exactly one of `authCode` or `idToken`. May be called repeatedly, so always return the latest code |
| `reAuthenticate`          | same data. If your login needs a page reload, start the login and resolve with no data                                                                                                  |
| `signIn` (step-up only)   | same data. You must also `AuthProvider.publish('signedIn', data)` or `publish('signInFailed', error)`                                                                                   |
| `logoutOIDC`              | implicit flow sign-out                                                                                                                                                                  |

Skeleton (abridged from the official example):

```js
Genesys('registerPlugin', 'AuthProvider', (AuthProvider) => {
  AuthProvider.registerCommand('getAuthCode', (e) => {
    e.resolve({ authCode: /* brand auth code */, redirectUri: /* your redirect uri */ });
  });
  AuthProvider.registerCommand('reAuthenticate', (e) => { /* re-login, then e.resolve(...) */ });
  AuthProvider.subscribe('Auth.loggedOut', () => { /* clear your own auth flags */ });
  AuthProvider.ready(); // mandatory
});
```

**Headless + Auth + autoStart.** This is verbatim from the AuthProvider page. In headless mode with Auth enabled, a WebSocket is opened automatically to restore any authenticated conversation, and with autoStart a new conversation would also start. To prevent that:

```js
AuthProvider.data('settings', {
  headless: {
    configureOnly: true,
  },
});
```

Later, call `MessagingService.joinConversation` when the user opens your UI.

**Auth plugin commands:** `Auth.logout`, `Auth.getTokens`, `Auth.refreshToken`, `Auth.reAuthenticate`.
**Auth plugin events:** `Auth.ready`, `Auth.authenticating` `{authCode, redirectUri}`, `Auth.authenticated` `{jwt, refreshToken?}`, `Auth.loggedOut` `{status, statusText, data}`, `Auth.authError`, `Auth.tokenError`, `Auth.authProviderError`, `Auth.error`, `Auth.logoutError`, `Auth.signInAvailable`, `Auth.signingIn`, `Auth.signedIn` `{authCode}`, `Auth.signInFailed`.

Token refresh is automatic. On a 403 the SDK tries the refresh token, then falls back to `AuthProvider.reAuthenticate`. Tokens are stored in localStorage (`_{deploymentId}:gcatkn`, `:gcartkn`), capped at 24 hours.

Step-up (anonymous → authenticated mid-conversation) requires `allowSessionUpgrade` in config. Flow: `MessagingService.stepUpConversation` → your `AuthProvider.signIn` → `MessagingService.steppedUpConversation`.

## Conversations

Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/conversationsPlugin

Events only: `Conversations.ready`, `Conversations.opened`, `Conversations.started`, `Conversations.closed`, `Conversations.error` (`{ error }`). Several of these describe the native "conversations UI". **UNVERIFIED** whether the plugin loads or publishes in headless mode. Use the `MessagingService` events instead.

## Journey and Engagement (Predictive Engagement)

Only relevant if `journeyEvents.enabled` and Predictive Engagement are in use.

Sources:

- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/journeyPlugin
- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/engagePlugin
- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK#using-engagement-plugin-with-predictive-engagement

- Tracking commands: `Journey.pageview` (`{pageTitle?, pageLocation?, customAttributes?, traitsMapper?, externalId?}`), `Journey.record` (`{eventName, customAttributes?, ...}`), plus `formsTrack`, `trackClickEvents`, `trackIdleEvents`, `trackInViewport`, `trackScrollDepth`, `recordActionStateChange`, `identify`.
- Proactive chat invite in headless mode: subscribe to `Journey.qualifiedWebMessagingOffer` (`{journeyContext, state, engageContent: {offerText}}`), render your own invite, then call `Engage.accept` or `Engage.reject`. Messenger then forwards the offer data to the messaging service automatically.

```js
Genesys('subscribe', 'Journey.qualifiedWebMessagingOffer', ({ data }) => {
  // write code to show your own Engagement user interface
});
```

Engage events: `Engage.ready`, `inviteAccepted`, `inviteRejected`, `inviteIgnored`, `inviteOffered`, `inviteError`. `Engage.invite` custom `offerText` is limited to 70 chars.

## Launcher and Messenger (UI plugins): mostly N/A in headless mode

- `Messenger.open` / `openConversation` / `openSearch` / `openCobrowse` **reject** in headless mode with "Messenger user interface must be enabled in your configuration."
  Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messengerPlugin
- `Messenger.clear` is the exception and is useful. It _"Clear[s] Messenger data from the browser storage, across all active tabs… After clearing, Messenger is shutdown and all further activity is rejected until the page is reloaded."_ It publishes `Messenger.cleared`. **UNVERIFIED** whether `Messenger.clear` is available in headless mode. The docs do not list a headless rejection for it.
- `Launcher.show` / `Launcher.hide` require launcher visibility `OnDemand`. The "Build your own launcher" example targets the **native** Messenger window (it calls `Messenger.open`), so it is not a headless example. In headless mode your own button just toggles your own UI.
  Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/launcherPlugin
- **The native launcher, window, toaster and Engage invite do not render in headless mode.** Confirmed from source, and observed in a live session on 2026-10-02: every native iframe stayed 0×0 ([sdk-source-notes.md](./sdk-source-notes.md#observed-in-a-live-session-2026-10-02)). Read on 2026-10-02 in `https://apps.mypurecloud.com/messenger/main.min.js` (the launcher iframe's bundle, Last-Modified 2026-09-07); `messengerrenderer.min.js` has the same code. The launcher's `render` is `!headlessMode.enabled && hasApps && <Launcher…>`, and the toaster lives inside that subtree. `determineDimensions`, `showLauncher` and `setConvDimension` all return early when `headlessMode.enabled` is true, so they never send `MessengerHelper.setDimension`. The Engage invite renders only under `!headlessMode.enabled`. The two page iframes are still injected, but they stay 0×0 and `inert` (see [sdk-source-notes.md](./sdk-source-notes.md#which-files)). So a lookalike launcher drawn by the page cannot clash visually with a native one. The Platform API's own description of `headlessMode` agrees: "native UI components will be disabled".

## CobrowseService and KnowledgeService (optional)

- `CobrowseService.*` (`acceptSession({joinCode})`, `declineSession({joinCode})`, `stopSession`, control/navigation/drawing commands; events `sessionStarted`, `sessionEnded`, `controlRequested`, ...). In headless mode, co-browse draws only the page border and agent cursor. Trigger it from `MessagingService.cobrowseOffer` using `data.sessionJoinToken`. The headless page's own example subscribes to `"MessengerService.cobrowseOffer"`, which looks like a **doc typo** for `MessagingService.cobrowseOffer`.
- `KnowledgeService.*` (`search`, `getSuggestions`, `getArticle`, ...) is the service-level knowledge base API, if you want self-service search in your UI.
