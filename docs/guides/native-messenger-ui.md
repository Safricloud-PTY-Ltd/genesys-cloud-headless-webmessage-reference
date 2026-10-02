# What the native Messenger looks like (visual spec)

This guide describes the out-of-the-box (non-headless) Genesys Cloud Messenger in numbers you can reproduce in CSS. Use it when a custom headless UI should look like the native one.

It does not cover behaviour. For that, see [native-messenger-behaviour.md](./native-messenger-behaviour.md).

## Sources and how to read this guide

Every value here was read on **2026-10-02** from the scripts Genesys publishes on its US East CDN. They were fetched with plain GETs: no deployment was loaded and no Messenger was opened.

| File                                                             | Version / Last-Modified                                    | What it holds                                                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `https://apps.mypurecloud.com/genesys-bootstrap/genesys.min.js`  | `genesys.js` 2.14.0                                        | Host-page iframes: position, size, z-index, alignment (`MessengerHelper` plugin)    |
| `https://apps.mypurecloud.com/messenger/messenger.html`          | —                                                          | Launcher iframe page. Loads `main.css` and `main.min.js`                            |
| `https://apps.mypurecloud.com/messenger/messenger-renderer.html` | —                                                          | Messenger iframe page. Loads `messengerrenderer.css` and `messengerrenderer.min.js` |
| `https://apps.mypurecloud.com/messenger/main.min.js`             | `messenger` 2.18.0, 2026-09-07                             | Launcher button, MUI themes, frame dimensions                                       |
| `https://apps.mypurecloud.com/messenger/messenger.min.js`        | `messenger` 2.18.0, 2026-09-07                             | The conversation UI: header, transcript, composer (webpack chunk 588)               |
| `https://apps.mypurecloud.com/messenger/main.css`                | `messenger` 2.18.0 (same bytes as `messengerrenderer.css`) | Container and full-screen rules                                                     |
| `https://apps.mypurecloud.com/messenger/messenger.css`           | `messenger` 2.18.0                                         | Composer position, typing-dot animation                                             |
| `https://apps.mypurecloud.com/messenger/muiVendor.min.js`        | 2026-09-07                                                 | Bundled Material UI (MUI) components and `@mui/icons-material` icons                |
| `https://apps.mypurecloud.com/messenger/i18n/en-us.json`         | —                                                          | Default English strings                                                             |

The UI is built with **Material UI (MUI)** and Emotion, using the class prefix `Cx-Mui`. Most styles are JavaScript style objects, not CSS files. The search strings below are exact text in the minified files.

How sure each claim is:

- **Confirmed** means the value appears literally in the cited file.
- **Inferred** means it was derived from code (for example, adding two offsets together) or from MUI defaults that Genesys does not override. It was not seen rendered.
- **UNVERIFIED** means it was not checked.

None of this was compared against a live render or a screenshot. These files are not a contract, and Genesys can change them at any time.

## Theme defaults

Source: `main.min.js`, search `const Z="#0165A7"` (dark theme) and `de="#0165A7"` (light theme). Overrides are applied in `configureStyles(e){` in `messengerrenderer.min.js`.

| Token                         | Value                                                                                                                                            | Status                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Primary when none configured  | `#0165A7`                                                                                                                                        | confirmed                       |
| Secondary                     | `#D2ECFD`                                                                                                                                        | confirmed                       |
| Error                         | `#B00020`                                                                                                                                        | confirmed                       |
| `common.lightGrey`            | `#ECECEC` (agent bubble, typing bubble, hover fills)                                                                                             | confirmed                       |
| `common.mediumGrey` (light)   | `#757575` (captions, system lines, typing dots, chip border)                                                                                     | confirmed                       |
| `common.textColor`            | `rgba(0, 0, 0, 0.87)`                                                                                                                            | confirmed                       |
| `common.outlineColor`         | `rgba(0, 0, 0, 0.55)` (focus outlines)                                                                                                           | confirmed                       |
| Highlight (`mark`)            | `#b5e2e8`                                                                                                                                        | confirmed                       |
| Font family                   | `"-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu", "Cantarell", "Open Sans", "Helvetica Neue", "sans-serif"` | confirmed                       |
| Base font size                | MUI `typography.fontSize: 15`. `body1`/`body2` are `0.938rem` (15px), weight 400                                                                 | confirmed                       |
| `h1` (header title)           | `1.3392857142857142rem` (about 21.4px), line-height 1.6, weight 400 (light theme)                                                                | confirmed                       |
| `subtitle2` (header subtitle) | weight 400. Size: MUI's default scaled by 15/14, so about 15px                                                                                   | weight confirmed, size inferred |
| `caption`                     | MUI default scaled by 15/14, so about 12.9px                                                                                                     | inferred                        |
| Input text                    | `0.938rem` on desktop, `1rem` on mobile, line-height `1.1876em`                                                                                  | confirmed                       |
| Paper shadow (`elevation2`)   | `0px 3px 1px -2px rgba(0,0,0,0.2), 0px 1px 1px 1px rgba(0,0,0,0.14), 0px 1px 5px 1px rgba(0,0,0,0.12)`                                           | confirmed                       |
| Focus ring                    | `ButtonBase` `&:focus-visible { outline: 2px solid; outline-offset: -3px }`                                                                      | confirmed                       |

Deployment overrides, applied by `configureStyles`:

- `styles.primaryColor` replaces `palette.primary.main`.
- `styles.secondaryColor` replaces `palette.secondary.main`.
- `styles.modeType` sets the palette mode (`light` or `dark`).
- `styles.fontSize` sets `typography.fontSize`.
- `styles.fontFamily` sets the font family.

**Text on primary** is MUI `getContrastText(primary)` with `contrastThreshold: 4.5`. The result is white or `rgba(0, 0, 0, 0.87)`, and Genesys bumps the dark case to `rgba(0, 0, 0, 0.93)` (search `"rgba(0, 0, 0, 0.87)"===s.palette.getContrastText`). Confirmed.

The documented `GenesysJS.configuration` command strips `messenger.styles` and `messenger.launcherButton` ([loading-the-sdk.md](./loading-the-sdk.md#genesysjsconfiguration-is-a-trimmed-copy)). The undocumented `GenesysJS.configurationReceived` event still carries them untrimmed; [loading-the-sdk.md](./loading-the-sdk.md) covers reading it.

## Host-page frames and position

Source: `genesys.min.js`, the `genesys-mxg-frame` style template and the `MessengerHelper` commands `setDimension`, `setDirection` and `setPositions`. All confirmed unless marked otherwise.

- **Two iframes**, both `position: fixed; border: none; z-index: 99999999`:
  - the launcher frame, `#genesys-mxg-frame`, titled "Messenger Launcher";
  - the window frame, `#genesys-mxg-container-frame`, titled "Messenger".
- **Default offsets.** `sideSpace: 20` and `bottomSpace: 12`, in px from the viewport edge. Both come from the deployment's `position` config and can be 0.
- **Alignment.** `position.alignment` is `auto` (the default), `left` or `right`. `auto` follows `document.dir`: `ltr` puts it on the right, `rtl` on the left.
- **Launcher frame size.** 72×72 for the default `Icon` display type (`getLauncherDimensions` in `main.min.js`).
- **Window frame size.** Width `426` (constant `KI`). Height `calc(70%)` of the viewport (constant `fq="70%"`), capped by `max-height: 712px`.
- **Window frame bottom.** Launcher frame height + `10` (`iMessengerBottomPadding`) + `bottomSpace`. With defaults that is 72 + 10 + 12 = **94px**.
- **Launcher shown on demand** (`OnDemand` visibility). The window sits at a fixed 92px bottom (`iMessengerLauncherSpace`), or at `bottomSpace` when there is no launcher.
- **Inside the window frame** (`main.css`):
  - `.cx-messenger-container` is `top:0; bottom:6px`.
  - `.cx-messenger` is `width: 96%; right: 8px; min-height: 195px`.
  - That makes the visible window about **409 px wide**, with its right edge 8px inside the frame. Its right edge sits about 28px from the viewport edge and its bottom about 100px up. (Inferred: 96% of 426, 20 + 8, 94 + 6.)
- **Other sizes:**
  - Expanded knowledge article: 90% × 600 (`s="90%"`, `a=600`).
  - Proactive (Engage) invite frame: width 410 (`gm`).
- **Max-height clamps.** The bootstrap has per-browser and per-zoom clamps (`.mxg-desktop-windows-chrome { max-height: 80% }`, and 70% or 75% at higher device-pixel ratios). Whether these apply at 100% zoom on a normal desktop is **UNVERIFIED**.
- **Mobile.** Full screen applies under `@media screen and (max-width: 600px)`, `max-device-width: 600px`, `max-device-height: 428px` landscape, or `max-device-width: 711px` landscape. `.genesys-mxg-conversation` / `.genesys-mxg-homescreen` become `100% × 100%` with `left/right/bottom: 0 !important`. Inside the frame, `.cx-messenger` becomes `100% × 100%` and the container gets `z-index: 99999`. MUI breakpoint `sm` is also 600. Confirmed.
- **Configured full screen.** `fullScreen` in the config adds `genesys-mxg-frame-fullscreen` (100% × 100%).

## Launcher button

Source: `main.min.js`, search `mxg-launcher-btn` and `getLauncherDimensions`. Fab defaults are from the bundled MUI `MuiFab` in `muiVendor.min.js`.

- **Element.** MUI `Fab`, `variant="circular"`, default `size="large"`, so **56×56**. Theme override `border-radius: 50% !important`. Confirmed.
- **Position in its frame.** `position: fixed; bottom: 12px` and `right: 8px` (or `left: 8px` when left-aligned). In viewport terms it sits about **28px from the side and 24px from the bottom** (inferred: 20 + 8, 12 + 12).
- **Colour.** Background `palette.primary.main !important`, icon `palette.primary.contrastText !important`. Confirmed.
- **Shadow.** `0px 3px 5px -2px rgb(0 0 0 / 20%), 0px 1px 4px 2px rgb(0 0 0 / 14%), 0px 1px 4px 1px rgb(0 0 0 / 12%)`. Confirmed.
- **Closed icon.** MUI `Chat` (filled speech bubble with three lines), **26×26**. A custom `launcherButton.icon.url` replaces it with an `<img>` (default 26px). Confirmed.
- **Open icon.** MUI `ExpandMore` (down chevron), `fontSize="large"`, forced to **38×38** (`.mxg-expand-more-icon`). The open launcher is the "minimise" control on desktop. Confirmed.
- **Display types** (`launcherButton.displayType`):
  - `Icon` (default).
  - `Text` and `IconAndText` are an extended pill: `border-radius: 28px`, `padding: 0 16px`, text `14px`, weight 500, `text-transform: none`, 8px gap after the icon.
  - Button text default is "Message Us", truncated to 20 characters.
  - On mobile, `IconAndText` collapses to the icon on scroll down: 400ms `cubic-bezier(0.4, 0.0, 0.2, 1)`.
  - All confirmed.
- **Hover.** The `!important` background stops MUI's hover darkening, so the inferred result is no colour change on hover.
- **Press.** A ripple at opacity 0.1 with a `scale(0)` to `scale(1)` keyframe. Confirmed.
- **Focus.** The focus-visible outline, plus a tooltip showing the accessible name. Confirmed.
- **Accessible name.** `aria-label` is "Open Assistance panel" when closed and "Minimize Assistance panel" when open, with `aria-expanded`. For `Text`/`IconAndText` it is `"<buttonText> - Open Assistance panel"`. Strings are `launcher.ariaOpenButton` and `ariaMinimizeButton` in `i18n/en-us.json`. Confirmed.
- **Unread badge.** The launcher render tree has no badge element (inferred from the `render()` in `main.min.js`).

## Window

Source: `messenger.min.js`, search `cx-messenger-container`.

- **Container.** MUI `Container maxWidth="sm"` holding an MUI `Grow` transition (`scale(e, e**2)` in `muiVendor.min.js`, `timeout: "auto"`). That is the MUI open animation: scale and fade from 0.75 / 0.5625. Confirmed.
- **Frame transition.** The host frame also gets `.genesys-mxg-frame-transition { transition: all 300ms }`. `.cx-messenger` has `transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1) 2ms`. Confirmed.
- **Panel.** MUI `Paper` `elevation={2}`, so it uses the `elevation2` shadow above. Its background is `linear-gradient(<primary>, rgba(0, 0, 0, 0.84) 200%)`. Confirmed.
- **Corner radius.** MUI's default `shape.borderRadius`, 4px (inferred: the theme does not override `shape`). The header is explicitly `4px 4px 0 0` (confirmed).
- **Body and transcript background.** The body below the header is an MUI `Paper` with `elevation: 0`, `square`, `class="mxg-home"` (search `className:\`mxg-home${q}\``). Its `sx`sets no background.`.mxg-conversation-container`and`.mxg-input-container`are`background-color: inherit` (`messenger.css`). So the background is MUI's default `palette.background.paper`, which is **`#fff`** in light mode and `#121212`in dark mode. The structure is confirmed. The colour is inferred: neither Genesys theme overrides`palette.background`, so MUI's default applies.

## Header

Source: `messenger.min.js`, search `className:\`mxg-header ${he}\``.

- **Colours.** Background `palette.primary.main`, text `palette.primary.contrastText`. Radius `4px 4px 0 0`, `min-width: 364px`. Confirmed.
- **Title.** Typography `h1`. Default "Message Us" (`conversations.headerTitle`). Confirmed.
- **Subtitle.** `subtitle2` rendered as `<h2>`, `padding-bottom: 22px`. `conversations` has no default subtitle in `en-us.json`. The home screen defaults are title "Welcome" and subtitle "We're here to help". Confirmed.
- **Heading box.**
  - `margin-top: 14px`.
  - `margin-bottom: 12px`, or 25px when expanded.
  - `padding-left: 16px`, `margin-right: 44px`, `min-height: 34px`, or 86px when expanded.
  - A collapsed header is 64px tall.
  - All confirmed.
- **Logo.** `homeScreen.logoUrl`. In the conversation view it shows in a row (`padding: 12px 6px 6px 6px`, max-height 70px, max-width 70, 160 or 200px depending on aspect ratio). On the home screen it shows larger, with `alt="Company Logo"`. Confirmed.
- **Buttons.** All are MUI `IconButton` (theme padding 12px) with **26×26** icons, `color: inherit`, absolutely positioned at `top: 6px`. Confirmed.
  - **Clear conversation:** a trash can (Material Symbols "delete", outlined). `aria-label` is "Clear and leave your conversation". Shown when conversation clear is enabled. It sits at `right: 0`, or `right: 44px` when the minimise button is also shown.
  - **Kebab menu:** MUI `MoreVert`. Replaces the trash when the user is signed in (authenticated). The menu holds the user's initials avatar and name, plus "Sign-in" and a "Clear" item. It has `drop-shadow(0px 2px 8px rgba(0,0,0,0.32))` and a 10px arrow.
  - **Minimise:** MUI `Remove` (a horizontal bar), `aria-label` "Minimize Assistance panel". It **only renders when full screen, on mobile or tablet-landscape, or when the launcher is hidden** (`(Dt||!S)`). On a desktop with the launcher visible, there is no minimise button in the header, because the launcher's chevron does that job.
  - **Back:** MUI `ChevronLeft`, used in sub-views.
  - **Close:** MUI `Close`, used in previews and forms.
  - **Expand / collapse:** MUI `Fullscreen` / `FullscreenExit`, used for knowledge articles.
- **End conversation.** There is no separate "End conversation" item in the header. Clear is the only conversation action. Confirmed for this build.

## Transcript

Source: `messenger.min.js`. Note Genesys' naming here: `inbound` is the customer and `outbound` is the agent or bot.

- **Scroll area.**
  - `padding: 0 16px 6px 16px` and `max-height: calc(100% - 171px)`.
  - A flex column with `margin-top: auto`, so messages sit at the bottom.
  - `scroll-behavior: smooth`.
  - Search `let kr={position:"absolute"`. Confirmed.
- **Message row.** `margin: 0 0 4px`. `padding-top: 6px`, but **0** when the previous message came from the same side, which groups consecutive bubbles. Confirmed.
- **Bubble**, common to both sides (search `"& .mxg-message-bubble":{`):
  - `padding: 12px; max-width: 75%; white-space: pre-wrap; word-break: break-word`.
  - No tail: the "tail" is one square corner.
  - Confirmed.
- **Customer bubble** (`.mxg-inbound`):
  - Right-aligned (`justify-content: flex-end`).
  - Background `palette.primary.main`, text `primary.contrastText`.
  - `border-radius: 8px 0px 8px 8px` (top-right corner square).
  - Confirmed.
- **Agent or bot bubble** (`.mxg-outbound`):
  - Left-aligned.
  - Background `#ECECEC`, text `#000`.
  - `border-radius: 0px 8px 8px 8px` (top-left corner square).
  - Confirmed.
- **Emoji-only message.** `font-size: 2.814rem`. Confirmed.
- **Images.** First corner radius 7px. Image plus text: the caption sits in a primary-coloured strip with `border-radius: 0 0 8px 8px`. Confirmed.
- **Markdown blocks.** `pre` gets `padding 9px`, `1px solid` border, radius 4px. `mark` uses the highlight colour. Confirmed.
- **Avatar.** Shown only when "humanize" is on and the show-avatar options are set.
  - MUI `Avatar`, 40×40 (`.mxg-humanize { width: 40px; height: 40px; padding: 0 6px 4px 0; align-self: flex-end }`), to the left of the agent bubble and aligned to its bottom.
  - Shows `from.avatar`, else the first letter of the agent's name.
  - A bot uses the configured bot `avatarUrl` or a fallback icon.
  - Confirmed. The circle and the grey fallback fill are MUI defaults (inferred).
- **Name and time caption.** Rendered below the bubble, in caption type, colour `#757575`, only when humanize is on. Confirmed.
  - Agent: `"<name> · <time>"`, `padding-left: 46px`, ellipsis at 65% width.
  - Customer: `"You · <time>"`, right-aligned, followed by `· Sending` or `· Sent`.
  - Without humanize, only the customer's "Sending" / "Sent" caption shows.
  - The default names are `agentDefaultName` "Agent", `botDefaultName` "Bot" and `customerDefaultName` "You".
- **Time format.** dayjs `LT`, which is `h:mm A` in English (`HH:mm` for `hi`). The time also shows as a hover/focus tooltip on each bubble: white background, `#757575`, `0.70rem`, placed `right-start` for the agent and `left-start` for the customer. Confirmed.
- **Date separator.** A centred caption, `#757575`, dayjs `ll` (for example "Oct 2, 2026"). Search `format("ll")`. Confirmed.
- **System and presence lines.** A centred caption, `#757575`, `white-space: pre-wrap` (`.mxg-system`). Confirmed.
- **Fixed copy:**
  - Start of conversation: "This is the beginning of your conversation with us. Please send a message to get started." (auto-start: "This is the beginning of your conversation with us.")
  - End: "Your conversation has ended", then a `LLL` timestamp and a "Start new" button.
  - Confirmed.
- **Typing indicator** (search `hr=(0,xt.Ay)("div")`, plus `messenger.css`). All confirmed.
  - A bubble with `#ECECEC` background, `border-radius: 0 8px 8px 8px`, `padding: 10px 12px`, `margin: 0 0 6px`.
  - Three dots (3 to 5 configurable): `6px` circles, colour `#757575`, `margin: 1px`.
  - Animation: `animation: 1.5s typing-dot ease-in-out infinite` with `animation-delay: calc(var(--animation-order) * 150ms)`.
  - Keyframes: `@keyframes typing-dot { 15% { transform: translateY(-35%); opacity: .5 } 30% { transform: translateY(0%); opacity: 1 } }`.
  - Screen-reader text: "Typing in progress".
- **Quick replies** (search `chipRef:this.chipRef` region):
  - MUI `Chip`, `variant="outlined"`, which becomes `filled` once chosen. Chips float right (the customer side), with `padding: 6px 0`.
  - Optional 24px image avatar.
  - Outlined border `#757575`, hover/focus fill `#ECECEC`.
  - Chips are disabled while offline.
  - Confirmed. MUI chip default height and radius (32px, pill) are overridden to `height: 100%` (inferred, so the rendered shape is **UNVERIFIED**).
- **Cards and carousels.** Partially read:
  - Card date `0.75rem` `#757575`.
  - Card caption `#757575`, weight 600.
  - Buttons are contained MUI `Button`s in primary with the `Send` icon at 20px.
  - Carousels use `mxg-carousel-icon-button-left/right`.
  - Full card metrics are **UNVERIFIED**.

## Composer

Source: `messenger.min.js`, search `Conversation-inputBox` and `id:"mxg-message-input"`, plus `messenger.css`. All confirmed unless marked otherwise.

- **Container** (`.mxg-input-container`). `position: absolute; bottom: 0; width: 100%; max-height: 40%; z-index: 1`. Top border `1px solid #8a8a8a` (focused: `1px solid #333`).
- **Field.**
  - MUI `TextField`, `variant="standard"`, `multiline`, `maxRows: 4`.
  - No underline, transparent background.
  - `padding: 19px 18px 16px`, square corners.
  - Placeholder opacity 0.65.
- **Placeholder text.** **"Type your message here"** (`typeMessagePlaceholder`; it is also the `aria-label`). `inputMessagePlaceholder` ("Send a message...") exists in `en-us.json` but this build does not use it for the field.
- **Keyboard.** Enter sends; Shift+Enter and Ctrl+Enter insert a newline.
- **Attach button.**
  - MUI `IconButton` with MUI `AttachFile` (paperclip) at 26×26, `float: left; margin-left: 4px`.
  - It becomes MUI `InsertPhoto` when only images are allowed.
  - `aria-label` "Attach file", tooltip "Opens a file upload dialog".
  - Shown only when attachments are allowed.
- **Send button.**
  - MUI `IconButton size="large"` with MUI `Send` (paper plane) at 26×26, `float: right; margin-right: 6px`.
  - `aria-label` "Send your message".
  - Disabled until there is text or an uploaded file.
- **Layout.** The markup order is: the full-width `TextField`, then a `<span>` holding the attach `<label>`/`IconButton` (`float: left`) and the send `IconButton` (`float: right`). No rule positions them absolutely. The only layout rules are the `Conversation-attachIcon` and `Conversation-sendIcon` floats and margins, plus `.mxg-send-icon { float: right }` in `messenger.css`. A float can't fit beside a 100%-wide box, so the buttons should sit on a **row below the text field**: paperclip at bottom-left, send at bottom-right. The markup and styles are confirmed. The visual result is inferred from CSS float rules; it was not seen rendered.
- **"Powered by Genesys" footer.** **None.** The string `powered` (case-insensitive) does not appear in `messenger.min.js`, `main.min.js`, `messengerrenderer.min.js`, `main.css`, `messenger.css` or `i18n/en-us.json`. Checked with `grep -i -c powered` on 2026-10-02. Confirmed for these files.

## Licence of the bundle and its icons

- Every Genesys file read carries the banner `@license: Genesys Cloud Services, Inc.`. That covers `genesys.min.js`, `main.min.js`, `messenger.min.js`, `main.css` and `messenger.css`. No open-source licence is stated. Treat the bundle's CSS, markup and code as **proprietary**: copy measurements, not code. Confirmed (banner text). The legal reading is ours, not legal advice.
- The icons are **not Genesys artwork**. They are open-licensed `@mui/icons-material` components (`createSvgIcon(path, "Chat" | "ExpandMore" | "Send" | "AttachFile" | "InsertPhoto" | "Close" | "Remove" | "MoreVert" | "ChevronLeft" | "Fullscreen" | "FullscreenExit")`) inside `muiVendor.min.js`. The trash icon is a Material Symbols path (`viewBox="0 -960 960 960"`). Confirmed.
- Take the icons from their upstream sources (below), not from the Genesys bundle.

## Icons: exact path data and where it comes from

All MUI icons use `viewBox="0 0 24 24"` (MUI `SvgIcon` default) and `fill="currentColor"`, with one `<path>` each.

The upstream source is the published npm package **`@mui/icons-material` 9.4.0** (`license: MIT`), fetched 2026-10-02 from `https://unpkg.com/@mui/icons-material@9.4.0/<Name>.mjs`. Version 9 has no `esm/` directory: `esm/Chat.js` returns 404 and the package `exports` maps `./*` to `./*.mjs`.

Each `d` below was compared as a string with the `createSvgIcon(path, "<Name>")` module in `https://apps.mypurecloud.com/messenger/muiVendor.min.js`. All seven are byte-identical.

| Native use                      | MUI icon      | Bundle module | `d`                                                                                                                                                                                                                                                       |
| ------------------------------- | ------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Launcher (closed)               | `Chat`        | 85546         | `M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2M6 9h12v2H6zm8 5H6v-2h8zm4-6H6V6h12z`                                                                                                                                            |
| Launcher (open)                 | `ExpandMore`  | 88629         | `M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z`                                                                                                                                                                                                            |
| Send                            | `Send`        | 76098         | `M2.01 21 23 12 2.01 3 2 10l15 2-15 2z`                                                                                                                                                                                                                   |
| Attach                          | `AttachFile`  | 92739         | `M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6z` |
| Minimise (mobile / full screen) | `Remove`      | 88824         | `M19 13H5v-2h14z`                                                                                                                                                                                                                                         |
| Back                            | `ChevronLeft` | 73708         | `M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z`                                                                                                                                                                                                           |
| Close                           | `Close`       | 63518         | `M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z`                                                                                                                                                   |

**Trash (clear conversation).** This is a Google **Material Symbols Outlined** `delete` at weight 400, optical size 48. It uses `viewBox="0 -960 960 960"` and `fill="currentColor"`, and is inlined in `messenger.min.js` (search `M261-120q-24.75`).

The Genesys path:

```text
M261-120q-24.75 0-42.375-17.625T201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18zm438-630H261v570h438zM367-266h60v-399h-60zm166 0h60v-399h-60zM261-750v570z
```

Upstream (Google), `https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/delete/materialsymbolsoutlined/delete_48px.svg`, fetched 2026-10-02:

```text
M261-120q-24.75 0-42.37-17.63Q201-155.25 201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438v-570ZM367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z
```

The two are the **same shape, written differently**:

- Genesys writes the second curve with the smooth shorthand `T201-180`. Google writes it out as `Q201-155.25 201-180`, which is exactly the reflected control point. Genesys also keeps three decimals (`42.375`) where Google rounds to two (`42.37`).
- Genesys closes each subpath with `z` instead of drawing the last segment back to the start (`H261Z`, `v399Z`).

This is what an SVG optimiser produces. An exact string match is the older community npm package `@material-symbols/svg-400@0.10.0` `outlined/delete.svg` (Apache-2.0). It equals the Genesys path except for those closepath shortenings.

Recommendation: copy the Google `delete_48px.svg` path as it is. It renders the same as Genesys' path, and its provenance is clean. Google's `delete_24px.svg` is a different drawing (`M280-120q-33 0…`), so don't use that one if the goal is to match Genesys.

## Licence notices to reproduce

- **MUI icons.** MIT. Text from `https://unpkg.com/@mui/icons-material@9.4.0/LICENSE`. The copyright line is exactly:

  ```text
  Copyright (c) 2014 Call-Em-All
  ```

  The MIT terms require "the above copyright notice and this permission notice" in all copies or substantial portions, so reproduce the whole MIT text with that line. The MUI path data is Google's Material Icons. Material Icons are Apache-2.0: `pnpm view material-design-icons license` gave `Apache-2.0`. Crediting both is the safe choice.

- **Material Icons and Material Symbols (Google).** Apache License 2.0. Text at `https://raw.githubusercontent.com/google/material-design-icons/master/LICENSE` (also `https://www.apache.org/licenses/LICENSE-2.0.txt`).
  - The repo's LICENSE is the stock Apache-2.0 text. Its appendix still reads `Copyright [yyyy] [name of copyright owner]`, so **no specific copyright line** is given.
  - The repo root (`gh api repos/google/material-design-icons/contents/`) has **no `NOTICE` file**. Apache-2.0 §4(d) only requires reproducing a NOTICE when the work includes one, so none is required.
  - What §4 still requires when redistributing: (a) give recipients a copy of the Apache-2.0 licence; (b) mark modified files as changed. A "derived from Material Symbols `delete`" comment beside copied paths covers that.
  - The repo README says: "We have made these icons available for you to incorporate into your products under the Apache License Version 2.0 … We'd love attribution in your app's _about_ screen, but it's not required."
  - A suitable attribution line (ours, not quoted from Google): `Material Icons and Material Symbols, Google, licensed under the Apache License 2.0`. The exact copyright holder name Google uses is **UNVERIFIED**.
