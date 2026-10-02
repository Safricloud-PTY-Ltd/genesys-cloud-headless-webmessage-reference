/**
 * The launcher button. Numbers are from docs/guides/native-messenger-ui.md ("Launcher button");
 * Genesys' CSS is never copied.
 *
 * Must hold:
 * - `.launcher`: `position: fixed`, `z-index: 99999999`; bottom `calc(var(--chat-bottom-space) +
 *   12px)`; side `calc(var(--chat-side-space) + 8px)` from the side named by the host's
 *   `data-side`. A 56px circle, primary background, `--chat-on-primary` icon, no border, the
 *   shadow `0 3px 5px -2px rgb(0 0 0 / 20%), 0 1px 4px 2px rgb(0 0 0 / 14%), 0 1px 4px 1px
 *   rgb(0 0 0 / 12%)`, centred content, no colour change on hover. Its `.icon` and `img` are
 *   26px; in `.launcher.open` the icon is 38px.
 * - `Text` and `IconAndText` launchers (a `.launcher-text` child present): an extended pill, 56px
 *   tall, `border-radius: 28px`, `padding: 0 16px`, the text 14px weight 500, 8px between icon
 *   and text. Width follows the content.
 * - At `max-width: 600px` the open launcher (`.launcher.open`) is `display: none`: the
 *   full-screen panel covers it, and a covered control must not stay in the tab order. The
 *   header's minimise button closes the panel there.
 * - Focus shows the shared `:focus-visible` outline, offset outside the circle.
 */
export const launcherStyles = `
chat-launcher { display: contents; }
.launcher {
  position: fixed; z-index: 99999999;
  bottom: calc(var(--chat-bottom-space) + 12px); right: calc(var(--chat-side-space) + 8px);
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  width: 56px; height: 56px; padding: 0; border: 0; border-radius: 50%;
  background: var(--chat-primary); color: var(--chat-on-primary);
  box-shadow: 0 3px 5px -2px rgb(0 0 0 / 20%), 0 1px 4px 2px rgb(0 0 0 / 14%),
    0 1px 4px 1px rgb(0 0 0 / 12%);
}
:host([data-side='left']) .launcher { right: auto; left: calc(var(--chat-side-space) + 8px); }
.launcher .icon, .launcher img { display: block; width: 26px; height: 26px; flex: none; }
.launcher.open .icon { width: 38px; height: 38px; }
.launcher.text {
  width: auto; min-width: 56px; padding: 0 16px; border-radius: 28px;
  font-size: 14px; font-weight: 500; line-height: 1; white-space: nowrap;
}
.launcher:focus-visible { outline: 2px solid var(--chat-primary); outline-offset: 2px; }
@media (max-width: 600px) { .launcher.open { display: none; } }
`;