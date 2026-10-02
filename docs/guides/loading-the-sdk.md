# Loading the SDK and the `Genesys()` command queue

Primary source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/genesysgf

## The single snippet

The deployment snippet creates a global `Genesys` function that buffers calls in a queue (`Genesys.q`). It then injects `genesys.min.js` asynchronously. When the script finishes initializing, it runs the queued calls in order. This is why you can call `Genesys(...)` immediately after the snippet runs, before the SDK has loaded.

**`genesys.min.js` replaces `window.Genesys` when it loads** (measured 2026-10-01 on `prod-euw1`, headless Chrome). After load, `window.Genesys` is the SDK's own dispatcher, not the snippet's queue function. The old function still exists, but nothing reads its queue any more. So **never keep a reference to the function the snippet created**: look `window.Genesys` up on every call. A wrapper that held the snippet's function saw `ready` (its `subscribe` calls were queued before load and drained), but every command sent after load, `startConversation` and `GenesysJS.configuration` included, went into the dead queue and never resolved. `installGenesys` in `src/messenger/shell/genesys/` returns a forwarder that does the lookup per call.

The docs give this snippet verbatim, for US East (Virginia):

```html
<script type="text/javascript" charset="utf-8">
  (function (g, e, n, es, ys) {
    g['_genesysJs'] = e;
    g[e] =
      g[e] ||
      function () {
        (g[e].q = g[e].q || []).push(arguments);
      };
    g[e].t = 1 * new Date();
    g[e].c = es;
    ys = document.createElement('script');
    ys.async = 1;
    ys.src = n;
    ys.charset = 'utf-8';
    document.head.appendChild(ys);
  })(window, 'Genesys', 'https://apps.mypurecloud.com/genesys-bootstrap/genesys.min.js', {
    deploymentId: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    environment: 'prod',
  });
</script>
```

Rules stated in the docs:

- _"you must call the `Genesys()` function only after the snippet has executed, otherwise the queue won't be ready."_ Without the snippet you get "Genesys is not defined."
- _"You should not change the values defined within the single snippet."_
- _"You must use one of our direct regional CDN URLs to load the `genesys.min.js` file. Copying its contents to your hosted file system and serving it from there is not supported."_ This means there is no supported npm package or self-hosted copy.

### Debug logging

To enable verbose console logging, add `debug: true` to the options object:

```js
  })(window, 'Genesys', 'https://apps.mypurecloud.com/genesys-bootstrap/genesys.min.js', {
    deploymentId: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    environment: 'prod',
    debug: true // optional - Enables Genesys browser console logging
  });
```

(Copy this from the docs' non-debug snippet. The docs' debug example contains a typo, `| |` instead of `||`, that makes it invalid JS.)

### CSP nonce variant

If your page uses a strict CSP, add `nonce` to the snippet's `<script>` tag. The CSP needs `script-src 'nonce-{random}' 'strict-dynamic' https:;`. Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/contentSecurityPolicy. See [gotchas.md](./gotchas.md#csp) for the per-region allowlist.

## Environment / region values

`environment` values (verbatim from the `genesysgf` page):

| Region                    | Environment       |
| :------------------------ | :---------------- |
| US East 1 (Virginia)      | prod              |
| US East 2 (Ohio)          | fedramp-use2-core |
| US West (Oregon)          | prod-usw2         |
| Canada (Central)          | prod-cac1         |
| Europe (Ireland)          | prod-euw1         |
| Europe (London)           | prod-euw2         |
| Europe (Frankfurt)        | prod-euc1         |
| Europe (Zurich)           | prod-euc2         |
| Asia Pacific (Mumbai)     | prod-aps1         |
| Asia Pacific (Tokyo)      | prod-apne1        |
| Asia Pacific (Seoul)      | prod-apne2        |
| Asia Pacific (Osaka)      | prod-apne3        |
| Asia Pacific (Sydney)     | prod-apse2        |
| South America (São Paulo) | prod-sae1         |
| Middle East (UAE)         | prod-mec1         |

### Script URL per environment

The script URL is `https://apps.<publicDomainName>/genesys-bootstrap/genesys.min.js`, where `<publicDomainName>` is the region's domain. The developer docs show only the US East URL. The table below was confirmed by measurement on 2026-10-01: every URL answered a plain GET with `200` and `Content-Type: text/javascript`, with no redirect, and the body began `/*! * genesys.js`.

| Environment       | Script URL                                                             |
| :---------------- | :--------------------------------------------------------------------- |
| prod              | `https://apps.mypurecloud.com/genesys-bootstrap/genesys.min.js`        |
| fedramp-use2-core | `https://apps.use2.us-gov-pure.cloud/genesys-bootstrap/genesys.min.js` |
| prod-usw2         | `https://apps.usw2.pure.cloud/genesys-bootstrap/genesys.min.js`        |
| prod-cac1         | `https://apps.cac1.pure.cloud/genesys-bootstrap/genesys.min.js`        |
| prod-euw1         | `https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js`         |
| prod-euw2         | `https://apps.euw2.pure.cloud/genesys-bootstrap/genesys.min.js`        |
| prod-euc1         | `https://apps.mypurecloud.de/genesys-bootstrap/genesys.min.js`         |
| prod-euc2         | `https://apps.euc2.pure.cloud/genesys-bootstrap/genesys.min.js`        |
| prod-aps1         | `https://apps.aps1.pure.cloud/genesys-bootstrap/genesys.min.js`        |
| prod-apne1        | `https://apps.mypurecloud.jp/genesys-bootstrap/genesys.min.js`         |
| prod-apne2        | `https://apps.apne2.pure.cloud/genesys-bootstrap/genesys.min.js`       |
| prod-apne3        | `https://apps.apne3.pure.cloud/genesys-bootstrap/genesys.min.js`       |
| prod-apse2        | `https://apps.mypurecloud.com.au/genesys-bootstrap/genesys.min.js`     |
| prod-sae1         | `https://apps.sae1.pure.cloud/genesys-bootstrap/genesys.min.js`        |
| prod-mec1         | `https://apps.mec1.pure.cloud/genesys-bootstrap/genesys.min.js`        |

Sources (accessed 2026-10-01):

- **Measurement.** Each URL above was fetched with `curl -s -w '%{http_code}|%{content_type}|%{num_redirects}'`. The Admin-generated snippet for prod-euw1 uses the same URL as the table.
- **The SDK's own table.** `genesys.min.js` (v2.14.0) bundles a service-discovery table of `{ name, env, region, status, publicDomainName }` records. Its `ServiceDiscovery` class turns the snippet's `environment` into `https://apps.<publicDomainName>`, and it loads every other Messenger asset from there, including `/genesys-bootstrap/plugins/` and `/messenger/main.min.js`. Every `publicDomainName` in that table matches the table above.
- **Login hosts.** https://help.mypurecloud.com/articles/aws-regions-for-genesys-cloud-deployment/ lists the login host for each region (`login.<same domain>`). https://developer.genesys.cloud/platform/api/ renders client-side and could not be read without a browser.

Observations from the same measurement:

- **Builds can differ by region.** 14 regions served byte-identical v2.14.0. `prod-mec1` served v2.10.23 (a different size and hash). Genesys rolls the bundle out per region. Load the script from the region that matches `environment`, as the docs require ("You must use one of our direct regional CDN URLs"). Don't load one region's script for every environment.
- **Environments missing from the docs table.** The SDK's table also lists `prod-apse1` (`apse1.pure.cloud`, Singapore), `prod-mxc1` (`mxc1.pure.cloud`, Mexico), and `eusc-edee1-core` (`edee1.eusc-pure.cloud`, EU Sovereign, status `alpha`). Each served `genesys.min.js` with 200 on 2026-10-01. They are not on the `genesysgf` page.
- **Accepted aliases.** The `ServiceDiscovery` constructor lowercases `environment` and maps `use1` to `prod` and `fedramp-use2` to `fedramp-use2-core`. It prefixes `prod-` to any other value that lacks it, except `dev`, `test`, and `eusc-edee1-core`, so `euw1` also works. This is undocumented behaviour; use the canonical names above.

## `Genesys()` actions

### `"command"`

```js
Genesys(
  'command',
  'Plugin.commandName',
  { property: 'value' },
  function (o) {
    /*fulfilled*/
  },
  function (o) {
    /*rejected*/
  },
);
```

| Data type | Description                | Status   | Value(s)                                  |
| :-------- | :------------------------- | :------- | :---------------------------------------- |
| string    | action type                | required | "command"                                 |
| string    | command name               | required | Follows _"PluginName.commandName"_ format |
| object    | command options            | optional | Any properties supported by the command   |
| function  | promise fulfilled callback | optional |                                           |
| function  | promise rejected callback  | optional |                                           |

The global form does **not** return a promise. You get results only through the two callbacks. To use `await`, wrap the call yourself:

```js
// Illustrative wrapper, not from Genesys docs.
const command = (name, options = {}) =>
  new Promise((resolve, reject) => Genesys('command', name, options, resolve, reject));
```

### `"subscribe"`

```js
Genesys('subscribe', 'Plugin.eventName', function (o) {
  /*callback*/
});
```

The callback always receives an envelope `{ time, publisher, event, eventName, data }`; replays to late subscribers omit `eventName`. This includes `sessionTimingUpdated` and `sessionWarning`: the two Developer Center examples that destructure their fields from the argument directly are wrong, read `.data`. Source: the CXBus code embedded in `genesys.min.js` and `messagingservice.min.js` 2.18.0, read 2026-10-01; see [sdk-source-notes.md](./sdk-source-notes.md#subscribing-the-callback-always-gets-an-envelope).

There is no global unsubscribe. `Genesys("subscribe", ...)` returns `undefined` and the global dispatcher has no `"unsubscribe"` action. Only a registered plugin object has `P.unsubscribe(eventName)`, which removes every callback that plugin registered for the event. Subscribe once at startup and route events through your own dispatcher, or register a uniquely named plugin per subscriber. Source: [sdk-source-notes.md](./sdk-source-notes.md#subscribing-there-is-no-global-unsubscribe) (read 2026-10-01).

Ready semantics (documented for every plugin): _"If the ready event is already published before you subscribe to it, it will simply republish again ensuring your callback function gets executed."_ So subscribing to `X.ready` late is safe.

### `"registerPlugin"`

`registerPlugin` gives you a plugin object with a richer API. It is documented in two places: the headless page (to read configuration) and the AuthProvider page (to implement auth).

```js
Genesys('registerPlugin', 'Plugin', function (Plugin) {
  Plugin.command('GenesysJS.configuration').then((data) => {
    console.log('Deployment configuration', data);
  });
});
```

The methods used on a registered plugin object in official examples are:

| Method                                                            | Seen in                                                                                                         | Purpose                                   |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `P.command(name, options?)` → `Promise`                           | headless page, AuthProvider example                                                                             | Call any plugin command and get a promise |
| `P.data(name, value?)`                                            | headless page (`Plugin.data("GenesysJS.configuration")`), AuthProvider (`AuthProvider.data('settings', {...})`) | Read or set data-model values             |
| `P.subscribe(eventName, cb)`                                      | AuthProvider example                                                                                            | Subscribe to events                       |
| `P.registerCommand(name, (e) => e.resolve(data) / e.reject(err))` | AuthProvider example                                                                                            | Expose commands that Messenger calls      |
| `P.publish(eventName, data)`                                      | AuthProvider example (`AuthProvider.publish('signedIn', data)`)                                                 | Publish events from your plugin           |
| `P.ready()`                                                       | AuthProvider example ("Tell Messenger that your plugin is ready (mandatory)")                                   | Mark your plugin ready                    |

Sources:

- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK
- https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/authenticatedMessenger

**UNVERIFIED:** There is no general reference page for the registered-plugin API. Calling `ready()` is documented as mandatory only for `AuthProvider`. Whether an arbitrary name such as `"Plugin"` also needs `ready()` is not stated. The docs' own example for `"Plugin"` does not call it.

## Reading the deployment configuration

There are two documented ways:

```js
// Command (promise)
Genesys('registerPlugin', 'Plugin', function (Plugin) {
  Plugin.command('GenesysJS.configuration').then((data) => {
    console.log('Deployment configuration', data);
  });
});

// Data model
Genesys('registerPlugin', 'Plugin', function (Plugin) {
  console.log('config', Plugin.data('GenesysJS.configuration'));
});
```

The command rejects with "Deployment config is not available" when no config exists. Source: https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK

The global form `Genesys('command', 'GenesysJS.configuration', {}, resolve, reject)` also works, and the command always succeeds once `MessagingService.ready` has fired. Before the config has loaded it rejects instead of waiting. Source: `genesys.min.js` 2.14.0, read 2026-10-01; see [sdk-source-notes.md](./sdk-source-notes.md#reading-the-deployment-configuration).

### Where the config comes from

At startup the SDK fetches two public, unauthenticated JSON files. Neither URL is documented; both are read from the published script (`https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js`, `@version: 2.14.0`, read 2026-10-01; `SERVICES.configs` and the `getConfig` command):

```text
https://api-cdn.<publicDomainName>/webdeployments/v1/deployments/<deploymentId>/domains.json
https://api-cdn.<publicDomainName>/webdeployments/v1/deployments/<deploymentId>/config.json
```

`<publicDomainName>` comes from the snippet's `environment`, using a table built into the script. For example, `prod-euw1` maps to `mypurecloud.ie`, so the host is `api-cdn.mypurecloud.ie`. A plain GET (for example `curl`) returns both files with no token. That makes them a quick way to check a deployment's live settings without the Admin UI.

- `domains.json` is `{"allowAllDomains": <boolean>, "allowedDomains": [<string>...]}`. The SDK fetches it first. Only if the page passes the domain check does it fetch `config.json`. Otherwise it publishes `GenesysJS.domainNotAllowed` and loads no config.
- `config.json` is the full configuration version (the `WebDeploymentConfigurationVersion` shape, the same as `GET /api/v2/webdeployments/configurations/{id}/versions/{n}`), plus the deployment's `status`. It carries everything in the documented shape above, plus `messenger.apps.conversations.{enabled, markdown, conversationDisconnect, conversationClear, humanize, notifications, sessionDurationSeconds}`, `messenger.sessionPersistenceType`, `cobrowse`, `auth.allowSessionUpgrade` and styling. It does **not** include the Supported Content Profile; the deployment references that profile separately.

**Domain check** (`isAllowedDomain` in the same script). The SDK compares `document.location.hostname` with each entry, ignoring case:

- `allowAllDomains: true` → allowed.
- An empty `allowedDomains` with `allowAllDomains` false → **always blocked**.
- An entry matches on an exact hostname match, or when the hostname ends with `.<entry>` (so `example.com` also allows `sub.example.com`).
- The check uses the hostname only: **scheme and port are ignored**. An entry of `localhost` allows `http://localhost:8080`. An entry that includes a port or scheme can never match.

The server also enforces allowed domains on API requests (see [gotchas.md](./gotchas.md#deployment-and-configuration-preconditions)). The client check above is only the first gate.

### `GenesysJS.configuration` is a trimmed copy

The documented `GenesysJS.configuration` command and data model do **not** return the raw `config.json`. They return a "public" copy with these paths removed (`removeConfigProps` in the script, same version):

```text
cobrowse, supportCenter, position, messenger.launcherButton, messenger.styles,
messenger.apps.conversations.markdown, messenger.homeScreen, messenger.apps.conversations.humanize
```

In particular, a headless UI **cannot read the markdown setting or any look-and-feel setting** through the documented command. The script's own comment calls this copy a _"Limited public decentralized config that we provide to customers, who can use this to build their own UI with headless mode"_. The trim is deliberate: the list sits under the comment _"We provide decentralized config to customers for headless mode. Remove the following properties from it."_ The untrimmed config is still reachable, through undocumented surfaces (next section).

### Reading the untrimmed config (look and feel, markdown)

Three ways, all **undocumented**. Read from `genesys.min.js` 2.14.0 (`apps.mypurecloud.com` and `apps.mypurecloud.ie`, byte-identical, read 2026-10-02). The same code is in the older 2.10.23 that `prod-mec1` serves.

1. **`GenesysJS.configurationReceived` event** (best of the three). Payload `{ deploymentConfig, snippetConfig }`, where `deploymentConfig` is the parsed `config.json`, untouched. It is _republished_, so a late subscriber gets it replayed. It fires before `MessagingService` is even loaded, and the snippet queue drains only after it. Details in [sdk-source-notes.md](./sdk-source-notes.md#reading-the-deployment-configuration).
2. **Data model** `Plugin.data('GenesysJS.deploymentConfig')` (inside `registerPlugin`). The same object, read synchronously. Data reads have no permission check.
3. **GET `config.json` yourself** (URL above). It works cross-origin: a GET for a nonexistent id on `api-cdn.mypurecloud.com` answered `403` from S3/CloudFront with `Access-Control-Allow-Origin: *`, measured 2026-10-02. It needs **no CSP change** in this repo: the SDK already fetches the same URL by XHR from the top page, and `api-cdn.<domain>` matches the `https://*.<domain>` `connect-src` entry for all 17 regions (checked against `scripts/securityHeaders.js`, 2026-10-02). It costs a second request, though, and skips the SDK's domain check. **UNVERIFIED:** the cache lifetime of a real `config.json` (not measured; it needs a real deployment id).

### Look-and-feel fields in the deployment configuration

These come from the `WebDeploymentConfigurationVersion` model in the public Platform API swagger (`https://api.mypurecloud.com/api/v2/docs/swagger`, which redirects to the S3 `publicapi-v2-latest.json`; read 2026-10-02). The "native default" column is what Genesys' own UI uses when a field is absent: page-side `MessengerHelper` in `genesys.min.js` 2.14.0, and the launcher bundle `https://apps.mypurecloud.com/messenger/main.min.js` (Last-Modified 2026-09-07). The Admin labels come from https://help.genesys.cloud/articles/configure-messenger/ (accessed 2026-10-02).

| Path                                                                     | Type (API)                                                                                                                                               | Native default / handling                                                                                                                                                                       |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messenger.styles.primaryColor`                                          | string, hex (example `#a7017c`)                                                                                                                          | `#0165A7`. Admin: "applies to the header, the background of customer message bubbles, and more"                                                                                                 |
| `position.alignment`                                                     | `Auto` \| `Left` \| `Right`                                                                                                                              | `auto`. The native code **lowercases** it. `auto` follows `document.dir` (`rtl` → left, otherwise right)                                                                                        |
| `position.sideSpace`, `position.bottomSpace`                             | integer (int32), px; no min/max in the schema                                                                                                            | `20`, `12`. Applied only when `typeof === 'number'`, so `0` is honoured                                                                                                                         |
| `messenger.launcherButton.visibility`                                    | `On` \| `Off` \| `OnDemand`                                                                                                                              | `on` (lowercased). Admin labels: Show (default) / Hide / Hide until triggered by business logic. With `on`, the native window sits 92px above `bottomSpace`                                     |
| `messenger.launcherButton.displayType`                                   | `IconAndText` \| `Icon` \| `Text`                                                                                                                        | `Icon` when absent or unknown (`getDisplayType`). Native button is 72×72 px, wider with text                                                                                                    |
| `messenger.launcherButton.icon.url`                                      | string                                                                                                                                                   | Built-in icon when empty or invalid. Admin: 26×26 recommended, 100×100 max                                                                                                                      |
| `messenger.homeScreen.{enabled, logoUrl}`                                | boolean, string                                                                                                                                          | Admin: logos larger than 200×70 are resized                                                                                                                                                     |
| `customI18nLabels[].{language, localizedLabels[].{key, value}}`          | `key`: `MessengerHomeHeaderTitle` \| `MessengerHomeHeaderSubTitle` \| `MessengerLauncherButtonText` \| `PushNotificationTitle` \| `PushNotificationBody` | Header title, subtitle and launcher text (Admin: launcher text "limited to 20 characters"). Not trimmed from the public copy                                                                    |
| `messenger.apps.conversations.humanize.{enabled, bot.{name, avatarUrl}}` | boolean, string, string                                                                                                                                  | Bot display name and avatar                                                                                                                                                                     |
| `headlessMode.enabled`                                                   | boolean                                                                                                                                                  | Not trimmed. When `true` the native launcher, window, toaster and invite never render (see [other-plugins.md](./other-plugins.md#launcher-and-messenger-ui-plugins-mostly-na-in-headless-mode)) |

The native `configureStyles` also reads `styles.secondaryColor` (default `#D2ECFD`), `styles.modeType` (`light`/`dark`/`auto`), `styles.fontSize` and `styles.fontFamily`. **None of these is in the API schema.** Treat them as optional, and **UNVERIFIED** whether any deployment ever carries them. **UNVERIFIED:** whether `styles`, `position` and `launcherButton` are still present in `config.json` once the Admin "User Interface" toggle is off. Always have a fallback for every field.

## Ready events relevant to headless

| Event                                                             | Meaning                                                                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `MessagingService.ready`                                          | Always published in headless mode. Subscribe before calling any `MessagingService.*` command                 |
| `Database.ready`                                                  | Database (custom attributes) plugin ready                                                                    |
| `Auth.ready`                                                      | Auth plugin ready (authenticated deployments)                                                                |
| `Journey.ready`                                                   | Journey plugin ready (when journey events are enabled)                                                       |
| `Engage.ready`, `KnowledgeService.ready`, `CobrowseService.ready` | Only if you use those features                                                                               |
| `GenesysJS.configurationReceived`                                 | Undocumented. Republished with the untrimmed `{ deploymentConfig, snippetConfig }`, before any product loads |
| `Messenger.ready`, `Launcher.ready`, `Conversations.ready`        | UI-oriented plugins. **UNVERIFIED** whether they publish in headless mode. Do not depend on them             |

Recommended startup pattern (illustrative, not from Genesys docs). Register every event subscription synchronously, right after the snippet. The queue runs calls in order, so your handlers are attached before the SDK can publish anything. Issue commands only after `MessagingService.ready`. In `messagingservice.min.js` 2.18.0 (read 2026-10-01), `ready` is published synchronously at the end of plugin registration, before the asynchronous `init` → `restore` and before any `started`. `ready`, `started`, `restoring` and `restored` are all _republished_: a late subscriber gets the **last** payload replayed, even if it is stale. See [sdk-source-notes.md](./sdk-source-notes.md#ready-started-restored-ordering-and-replay).

```js
Genesys('subscribe', 'MessagingService.restored', ({ data }) => {
  /* render data.messages */
});
Genesys('subscribe', 'MessagingService.messagesReceived', ({ data }) => {
  /* append data.messages */
});
// ...all other subscriptions...
Genesys('subscribe', 'MessagingService.ready', () => {
  // now safe to call MessagingService.* commands (see messaging-service.md)
});
```
