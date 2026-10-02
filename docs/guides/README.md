# Genesys Cloud Web Messaging: headless mode guides

These guides cover building a custom chat UI on Genesys Cloud Web Messaging using **headless mode** of the Messenger JavaScript SDK (the `Genesys(...)` command queue).

Anything not confirmed by an official source is marked **UNVERIFIED**. Code blocks taken from Genesys docs are reproduced verbatim. Blocks labelled "illustrative" are ours.

| Guide                                                            | Summary                                                                                                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [headless-mode-overview.md](./headless-mode-overview.md)         | What headless mode is, how to enable it (configuration, not snippet), what you gain and lose, prerequisites, and how it differs from the raw Guest API WebSocket                      |
| [loading-the-sdk.md](./loading-the-sdk.md)                       | The deployment snippet, environment/region values, the `command` / `subscribe` / `registerPlugin` actions, reading the deployment config, ready events                                |
| [messaging-service.md](./messaging-service.md)                   | `MessagingService` commands and events with exact names and payloads, the start/join rules, the message object schema and error format                                                |
| [other-plugins.md](./other-plugins.md)                           | Database (custom attributes), Auth/AuthProvider, Conversations, Journey/Engage, Launcher/Messenger (mostly N/A in headless), co-browse and knowledge                                  |
| [structured-messages.md](./structured-messages.md)               | Quick replies, cards, carousels, date/list pickers and forms: received shapes and how to post responses back                                                                          |
| [rich-text.md](./rich-text.md)                                   | The markdown subset the native UI renders in message text (marked 4.3.0 + six Genesys extensions + DOMPurify), link handling, the `markdown.enabled` flag, the `Markdown` plugin      |
| [sdk-source-notes.md](./sdk-source-notes.md)                     | What the published SDK scripts actually do: subscribe envelope, no unsubscribe, republish/ordering, the two message shapes, filtering, command callback timing, typing, history order |
| [native-messenger-ui.md](./native-messenger-ui.md)               | What the native (non-headless) Messenger looks like, in reproducible numbers: theme, launcher, window, header, bubbles, composer, icon provenance and licences                        |
| [native-messenger-behaviour.md](./native-messenger-behaviour.md) | How the native Messenger window behaves: launcher toggle and visibility modes, open-state persistence, header actions, home screen, start and end, default English labels             |
| [gotchas.md](./gotchas.md)                                       | Config preconditions, persistence/resume/multi-tab, CSP, typing, receipts, rate and size limits, attachment rules, headless-vs-native differences, doc errata                         |

## Sources (accessed 2026-10-01)

The Developer Center is a client-rendered SPA. Its page content was read from the Markdown sources that back those pages (served from `https://yeticms-api.genesys.cloud/assets/gc-dev-center/<page-path>.md`). The canonical page URLs are listed below.

Genesys Developer Center:

- Messenger JavaScript SDK: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/
- `Genesys()` global function: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/genesysgf
- Messenger Headless Mode SDK: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK
- Commands and events index: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/
- MessagingService plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messagingServicePlugin
- Database plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/databasePlugin
- Auth plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/authPlugin
- AuthProvider plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/authProviderPlugin
- Authenticated Messenger: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/authenticatedMessenger
- Conversations plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/conversationsPlugin
- Journey plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/journeyPlugin
- Engagement plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/engagePlugin
- Launcher plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/launcherPlugin
- Messenger plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messengerPlugin
- CobrowseService plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/cobrowseServicePlugin
- KnowledgeService plugin: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/knowledgeServicePlugin
- Plugin examples: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/pluginExamples
- Local storage reference: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/localStorage
- Web messaging overview: https://developer.genesys.cloud/commdigital/digital/webmessaging/
- Web messaging Guest API (WebSocket): https://developer.genesys.cloud/commdigital/digital/webmessaging/websocketapi
- Content Security Policy: https://developer.genesys.cloud/commdigital/digital/webmessaging/contentSecurityPolicy
- Web deployments APIs: https://developer.genesys.cloud/commdigital/digital/webmessaging/webdeployments-apis
- Regions / Apps URLs: https://developer.genesys.cloud/platform/api/
- Organization limits (Web Messaging): https://developer.genesys.cloud/organization/organization/limits
- Platform API swagger (schemas `WebDeploymentConfigurationVersion`, `WebMessagingMessage`, `WebMessagingContent`, etc.): https://api.mypurecloud.com/api/v2/docs/swagger

Genesys Cloud Resource Center:

- Configure Messenger: https://help.genesys.cloud/articles/configure-messenger/
- Deploy Messenger: https://help.genesys.cloud/articles/deploy-messenger/
- Session persistence FAQ: https://help.genesys.cloud/faqs/what-is-messenger-session-persistence-and-how-does-it-work/
- Deprecation of configurable session persistence: https://help.genesys.cloud/announcements/deprecation-configurable-session-persistence-methods-in-messenger/
- Co-browse for Messenger requirements: https://help.genesys.cloud/articles/co-browse-for-messenger-requirements/

Genesys Developer Community (supporting, non-normative):

- startConversation vs configureConversation/joinConversation (answered by Genesys staff): https://community.genesys.com/discussion/messagingservicestartconversation-does-not-trigger-backend-post-in-headlessmodetrue
- conversationDisconnected not firing (unresolved): https://community.genesys.com/discussion/messagingserviceconversationdisconnected-not-triggering
- clearSession vs clearConversation (unanswered): https://community.genesys.com/discussion/best-way-to-end-a-conversation-with-headless-mode-sdk
- Request for a headless blueprint (no blueprint provided): https://community.genesys.com/discussion/need-blue-print-for-headless-sdk-messenger

GitHub: as of the access date, no official Genesys (MyPureCloud / GenesysCloudBlueprints) repository or blueprint demonstrating **web** headless Messenger was found. The related official repos are mobile-only (`MyPureCloud/genesys-messenger-transport-mobile-sdk`) or auth-specific (`GenesysCloudBlueprints/messenger-authentication-okta-integration-blueprint`).
