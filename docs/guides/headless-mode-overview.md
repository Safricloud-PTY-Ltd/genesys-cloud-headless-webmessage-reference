# Headless mode overview

Headless mode runs Genesys Cloud Messenger with no UI. You load the normal deployment snippet (`genesys.min.js`), switch off the Messenger UI in the deployment's configuration, and build your own chat UI on top of the SDK's service-level plugins. The main one is `MessagingService`.

## What it is

> "The Messenger Headless Mode SDK allows you to run Messenger without a user interface, providing all service level commands and publishing events, so you can build your own user interface."

Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK

The Platform API schema describes `headlessMode` on a configuration version like this: _"Headless Mode Support which Controls UI components. When enabled, native UI components will be disabled and allows for custom-built UI."_ (`WebDeploymentHeadlessMode` has one property, `enabled: boolean`.)

Source: https://api.mypurecloud.com/api/v2/docs/swagger (definition `WebDeploymentConfigurationVersion.headlessMode`)

## How to enable it

You enable headless mode in the **Messenger configuration**. You do not enable it in the snippet.

- In Admin, the setting is the **User Interface** toggle in the Messenger configuration's Appearance section: _"Turn on the toggle to deploy Messenger with the native user interface. Turn off the toggle and build your own messaging client through the Messenger's Headless SDK functions."_
  Source: https://help.genesys.cloud/articles/configure-messenger/
- In the API, the setting is `headlessMode.enabled: true` on the configuration version (`/api/v2/webdeployments/configurations`). The deployment must then use that configuration version.
  Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/webdeployments-apis
- The snippet does not change. The docs say _"You should not change the values defined within the single snippet."_ There is no documented `headless: true` snippet option.
  Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/genesysgf

## What you get vs. what you lose

|                                                                                                                  | Stock Messenger UI                                                        | Headless                                                                               |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `MessagingService` plugin                                                                                        | Lazily loaded when Messenger opens (via `Messenger.open` or the launcher) | **Always loaded**. `MessagingService.ready` is always published                        |
| Messenger window, launcher, transcript rendering                                                                 | Provided                                                                  | You build it                                                                           |
| `Messenger.open` / `openConversation` / `openSearch` / `openCobrowse`                                            | Work                                                                      | **Reject** with _"Messenger user interface must be enabled in your configuration."_    |
| Session persistence, reconnection, history paging, file upload transport, auth token handling, custom attributes | Provided                                                                  | **Still provided** by the SDK. You subscribe to events and render the results          |
| Co-browse                                                                                                        | Full UI                                                                   | Page border and agent cursor only. You build the toolbar and the accept/decline prompt |
| Predictive Engagement invite                                                                                     | Built-in                                                                  | You render the invite and call `Engage.accept` / `Engage.reject`                       |
| Session-expiry warning AlertBar                                                                                  | Built-in                                                                  | You render it from `MessagingService.sessionWarning`                                   |

Sources:

- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messagingServicePlugin (loading behaviour table)
- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messengerPlugin (rejections)
- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK (co-browse, engagement, session lifecycle)

## Your UI must honour the deployment configuration

The docs state that you need the deployment configuration to build a correct UI. For example, hide the upload button when attachments are disabled. You can read it with the internal `GenesysJS.configuration` command or data model (see [loading-the-sdk.md](./loading-the-sdk.md#reading-the-deployment-configuration)). The documented shape is:

```json
{
  "id": "<String>", // Contains the Id in UUID format
  "version": "<number>",
  "languages": "<Array>", // An array of selected languages by the end user
  "defaultLanguage": "<String>", // Set to 'en-us' by default
  "apiEndpoint": "<Url>", // For example: https://apps.mypurecloud.com
  "headlessMode": {
    "enabled": "<boolean>" // Enable or disable headless mode
  },
  "messenger": {
    "enabled": "<boolean>", // Enable or disable messenger
    "apps": {
      "conversations": {
        "messagingEndpoint": "",
        "showAgentTypingIndicator": "<boolean>", // To show typing activity in Messenger UI.
        "showUserTypingIndicator": "<boolean>", // To avoid sending user typing events from Messenger.
        "autoStart": {
          "enabled": "<boolean>" // Enable or disable autoStart
        }
      }
    },
    "fileUpload": {
      "enableAttachments": "<boolean>", // Enable or disable Supported Content Profile in web messaging
      "modes": [
        {
          "fileTypes": "<Array>", //  An array of accepted file types
          "maxFileSizeKB": "<number>"
        }
      ]
    }
  },
  "journeyEvents": {
    "enabled": "<boolean>" // Enable or disable journey Events
  },
  "auth": {
    "enabled": "<boolean>" // Enable or disable authentication
  },
  "status": "<String>"
}
```

Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK

These configuration flags change how a headless UI must behave:

| Config (Platform API name)                                                              | Effect on headless                                                                                                                                 |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messenger.apps.conversations.autoStart.enabled`                                        | Controls whether you need `configureConversation` + `joinConversation`. See [messaging-service.md](./messaging-service.md#starting-a-conversation) |
| `messenger.apps.conversations.conversationDisconnect` `{enabled, type: Send\|ReadOnly}` | Required for `conversationDisconnected` / `readOnlyConversation` / `resetConversation`                                                             |
| `messenger.apps.conversations.conversationClear.enabled`                                | Required for `MessagingService.clearConversation`                                                                                                  |
| `messenger.apps.conversations.sessionDurationSeconds`                                   | Guest session timeout. Drives the `session*` events                                                                                                |
| `messenger.fileUpload.enableAttachments`                                                | Whether `requestUpload` works. If present, read allowed types from `MessagingService.allowedFileTypes` and ignore `modes`                          |
| `authenticationSettings.enabled` / `allowSessionUpgrade`                                | Authenticated messaging and step-up                                                                                                                |

Source: Platform API swagger definitions `ConversationAppSettings`, `ConversationDisconnectSettings`, `ConversationClearSettings`, `AuthenticationSettings` (https://api.mypurecloud.com/api/v2/docs/swagger). The SDK `config.json` shape above uses `auth.enabled`, while the Platform API uses `authenticationSettings.enabled`. They are different representations of the same setting.

## Prerequisites

1. **Messenger configuration** with the User Interface toggle **off**: https://help.genesys.cloud/articles/configure-messenger/
2. **Messenger deployment**: Admin > Message > Messenger Deployments > New Deployment. Set it Active, select the configuration version, a Supported Content Profile, allowed domains and an **inbound message flow**. After you save, the page shows the **snippet and deployment key**. https://help.genesys.cloud/articles/deploy-messenger/
3. **Allowed domains**: when domains are restricted, _"Messenger does not run on that website and rejects API requests from that domain."_ "Allow all domains" exists for testing. (Same source.)
4. **Region / environment**: the snippet's `environment` value and CDN URL must match the org's region. See [loading-the-sdk.md](./loading-the-sdk.md#environment--region-values).
5. **deploymentId**: a UUID shown with the snippet.

## Headless SDK vs. the Web Messaging Guest API

Genesys also documents a raw WebSocket **Guest API**: `wss://webmessaging.{region-domain}/v1?deploymentId=...`. The Developer Center links it under "Custom guest interface" as the option _"if you prefer to enable web messaging with a custom guest interface (instead of Messenger)"_.

Sources:

- https://developer.genesys.cloud/commdigital/digital/webmessaging/
- https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi

|                                                                        | Headless Messenger SDK                                            | Guest API (raw WebSocket)                                                       |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Transport                                                              | `genesys.min.js` from the Genesys CDN. The SDK owns the WebSocket | You open and own the WebSocket                                                  |
| Session token                                                          | Managed by SDK in browser storage                                 | You generate a UUID `token`, store it, and send `configureSession`              |
| Reconnect, offline handling                                            | Built in (`offline` / `reconnecting` / `reconnected`)             | You implement it. `echo` health check is limited to 2 per connection per minute |
| History                                                                | `fetchHistory` command (paged)                                    | REST `GET /api/v2/webmessaging/messages` with a 1-minute JWT from `getJwt`      |
| Attachments                                                            | `requestUpload` does the presigned upload for you                 | You request a presigned URL, PUT the file, then send the attachment ID          |
| Auth                                                                   | `AuthProvider` plugin plus the Auth plugin token lifecycle        | `configureAuthenticatedSession` and your own refresh handling                   |
| Journey / Predictive Engagement, co-browse, custom attributes plumbing | Available via plugins                                             | Journey context fields only. No co-browse plugin                                |
| Runtime dependency                                                     | One third-party script that cannot be self-hosted                 | None. Works with native `WebSocket`                                             |

How the two relate: the SDK's message objects **are** Guest API message bodies. The `MessagingService` docs repeatedly say _"Refer to the `body` attribute [in the Guest API docs] for message object data format."_ So the Guest API page is the schema reference for both approaches.

For this project, use headless SDK mode. The Guest API matters only as (a) the reference for message object shapes, error formats and limits, and (b) a fallback if a script-free or self-hosted transport becomes a hard requirement.
