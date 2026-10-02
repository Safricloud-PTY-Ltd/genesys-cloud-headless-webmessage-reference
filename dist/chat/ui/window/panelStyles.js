/**
 * The host, shared basics, the panel, its header, the Clear confirmation and the home screen.
 * Numbers are from docs/guides/native-messenger-ui.md ("Theme defaults", "Host-page frames and
 * position", "Window", "Header"); Genesys' CSS is never copied.
 *
 * Must hold:
 * - `:host`: a zero-size block (the launcher and panel are fixed), defaults for the custom
 *   properties (`--chat-primary: #0165a7`, `--chat-on-primary: #ffffff`, `--chat-side-space:
 *   20px`, `--chat-bottom-space: 12px`), native's font stack at 15px, text
 *   `rgba(0, 0, 0, 0.87)`. `*` uses `box-sizing: border-box`. `[hidden]` is
 *   `display: none !important`. `.visually-hidden` clips to 1px.
 * - Focus: every focusable control shows `:focus-visible` as a 2px solid outline (WCAG 2.2 AA;
 *   native uses `outline: 2px solid; outline-offset: -3px` on its buttons).
 * - Buttons: base `button` as an MUI outlined button (4px radius, 6px 16px padding, weight 500,
 *   primary border and text, transparent); `button.primary` and `button[type='submit']`
 *   contained (primary background, `--chat-on-primary` text); `:disabled` and
 *   `[aria-disabled='true']` at reduced opacity. `.icon-button`: no border or background,
 *   `color: inherit`, a 50px circle (12px padding round a 26px `.icon`), a faint hover fill.
 * - `.panel`: `position: fixed`, `z-index: 99999999`, white, 4px radius, MUI elevation-2 shadow,
 *   a flex column, `overflow: hidden`. 409px wide (no wider than the viewport less both side
 *   spaces), `height: 70vh` capped at 712px, at least 195px. Its side edge is
 *   `calc(var(--chat-side-space) + 8px)` from the viewport side named by the host's `data-side`
 *   (`right` or `left`); its bottom `calc(var(--chat-bottom-space) + 88px)` while
 *   `:host([data-launcher='shown'])` (native: the 72px launcher frame, 10px, 6px), else
 *   `var(--chat-bottom-space)`. Opens with MUI's grow (scale 0.75 and fade to 1 over about
 *   200ms) only under `prefers-reduced-motion: no-preference`.
 * - At `max-width: 600px` the panel is full screen: `inset: 0`, 100% wide and tall, no radius.
 * - Header (`chat-header .header`): primary background, `--chat-on-primary` text, radius
 *   `4px 4px 0 0`, at least 64px tall; a row: `.back`, then the logo (`.logo`, max 70px tall, max
 *   200px wide), the title block (`.title` about 21.4px weight 400 line-height 1.6, margin 14px
 *   0 12px 16px; `.subtitle` 15px weight 400), then `.clear` and `.minimise` at the end.
 *   `.header.home` is the expanded home header: at least 86px of title block, subtitle with 22px
 *   below it. `.minimise` is hidden unless it has `[data-always]` or the screen is at most 600px.
 * - `.confirm`: over the whole panel (`position: absolute; inset: 0` against the fixed panel),
 *   a `rgba(0, 0, 0, 0.5)` backdrop, and a centred white card (4px radius, 24px padding,
 *   elevation shadow) with its message and its buttons in a right-aligned row.
 * - Home (`chat-home`): `.home-card` a white card with 16px margin and padding, 4px radius and
 *   MUI elevation-1 shadow; its `h3` 16px weight 500; `.preview` one line, ellipsis, `#757575`;
 *   buttons full width, stacked with 8px between.
 * - `chat-conversation` fills the rest of the panel as a flex column (`flex: 1; min-height: 0`).
 */
export const panelStyles = `
:host {
  --chat-primary: #0165a7;
  --chat-on-primary: #ffffff;
  --chat-side-space: 20px;
  --chat-bottom-space: 12px;
  display: block;
  width: 0;
  height: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu,
    Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 15px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.87);
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
:focus-visible { outline: 2px solid; outline-offset: 2px; }
button:focus-visible { outline-offset: -3px; }
a { color: var(--chat-primary); }
button {
  font: inherit; font-weight: 500; line-height: 1.75; text-transform: none; cursor: pointer;
  padding: 6px 16px; border: 1px solid var(--chat-primary); border-radius: 4px;
  background: transparent; color: var(--chat-primary);
}
button.primary, button[type='submit'] {
  background: var(--chat-primary); color: var(--chat-on-primary);
}
button:disabled, button[aria-disabled='true'] { opacity: 0.5; cursor: default; }
button.icon-button {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  padding: 12px; border: 0; border-radius: 50%; background: transparent; color: inherit;
}
button.icon-button:hover { background: rgba(0, 0, 0, 0.04); }
.icon { display: block; width: 26px; height: 26px; flex: none; }
.panel {
  position: fixed; z-index: 99999999; inset: 0; width: 100%; height: 100%;
  display: flex; flex-direction: column; overflow: hidden; background: #ffffff;
}
@media (min-width: 601px) {
  .panel {
    inset: auto; right: calc(var(--chat-side-space) + 8px); bottom: var(--chat-bottom-space);
    width: min(409px, 100vw - 2 * var(--chat-side-space));
    height: 70vh; max-height: 712px; min-height: 195px; border-radius: 4px;
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 1px 1px rgba(0, 0, 0, 0.14),
      0 1px 5px 1px rgba(0, 0, 0, 0.12);
    transform-origin: bottom right;
  }
  :host([data-side='left']) .panel {
    right: auto; left: calc(var(--chat-side-space) + 8px); transform-origin: bottom left;
  }
  :host([data-launcher='shown']) .panel { bottom: calc(var(--chat-bottom-space) + 88px); }
  chat-header .header { border-radius: 4px 4px 0 0; }
}
@media (prefers-reduced-motion: no-preference) {
  .panel { animation: chat-grow 200ms cubic-bezier(0.4, 0, 0.2, 1); }
}
@keyframes chat-grow { from { opacity: 0; transform: scale(0.75, 0.5625); } }
chat-header { display: block; flex: none; }
chat-header .header {
  display: grid; align-items: start; min-height: 64px;
  grid-template-columns: auto auto minmax(0, 1fr) auto auto;
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas: 'back logo title clear minimise' 'back logo subtitle clear minimise';
  background: var(--chat-primary); color: var(--chat-on-primary);
}
chat-header .header .icon-button { margin-top: 6px; }
chat-header .back { grid-area: back; }
chat-header .clear { grid-area: clear; }
chat-header .minimise { grid-area: minimise; }
chat-header .logo {
  grid-area: logo; display: block; max-height: 70px; max-width: 200px; padding: 12px 6px 6px;
}
chat-header .title {
  grid-area: title; margin: 14px 0 12px 16px; font-size: 21.4px; font-weight: 400;
  line-height: 1.6; overflow-wrap: anywhere;
}
chat-header .title:has(+ .subtitle:not([hidden])) { margin-bottom: 0; }
chat-header .subtitle {
  grid-area: subtitle; margin: 0 0 12px 16px; font-size: 15px; font-weight: 400;
  overflow-wrap: anywhere;
}
chat-header .header.home { min-height: 125px; }
chat-header .header.home .subtitle { padding-bottom: 22px; }
chat-header .minimise:not([data-always]) { display: none; }
@media (max-width: 600px) {
  chat-header .minimise:not([data-always]) { display: inline-flex; }
}
chat-header .confirm {
  position: absolute; inset: 0; z-index: 2; margin: auto;
  width: min(100% - 32px, 20rem); height: fit-content;
  display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px;
  padding: 24px; border-radius: 4px; background: #ffffff; color: rgba(0, 0, 0, 0.87);
  box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2), 0 24px 38px 3px rgba(0, 0, 0, 0.14),
    0 0 0 100vmax rgba(0, 0, 0, 0.5);
}
chat-header .confirm::before { content: ''; position: absolute; inset: -100vmax; z-index: -1; }
chat-header .confirm p { flex-basis: 100%; margin: 0 0 16px; }
chat-home { display: block; flex: 1; min-height: 0; overflow-y: auto; }
chat-home .home-card {
  margin: 16px; padding: 16px; border-radius: 4px; background: #ffffff;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
}
chat-home .home-card h3 { margin: 0 0 8px; font-size: 16px; font-weight: 500; }
chat-home .preview {
  margin: 0 0 16px; color: #757575; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis;
}
chat-home .home-card button { display: block; width: 100%; }
chat-home .home-card button + button { margin-top: 8px; }
chat-conversation { display: flex; flex-direction: column; flex: 1; min-height: 0; }
`;