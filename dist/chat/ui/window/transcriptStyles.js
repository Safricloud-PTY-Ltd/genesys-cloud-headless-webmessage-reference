/**
 * The conversation screen above the composer: status lines, notice, transcript rows, typing
 * indicator and quick replies. Numbers are from docs/guides/native-messenger-ui.md
 * ("Transcript"); Genesys' CSS is never copied.
 *
 * Must hold:
 * - `.status`, `.session-warning`: centred captions, `#757575`, collapsing to nothing while empty.
 *   `.notice`: a row with the dismiss button, error colour `#b00020` on a light tint.
 * - `.scroller`: `flex: 1`, scrolls vertically, padding `0 16px 6px`, a flex column whose
 *   transcript sits at the bottom (`margin-top: auto` on the list); smooth scrolling only under
 *   `prefers-reduced-motion: no-preference`. `.history` a text button in primary, centred;
 *   `.history-note` a centred caption. `fieldset.answer-gate` adds no box.
 * - `ol.transcript`: no bullets or padding. `.message`: a flex row, `margin: 0 0 4px`,
 *   `padding-top: 6px`, but 0 when the previous row is a message from the same side (group
 *   consecutive bubbles with sibling selectors). `.inbound` (the customer) to the right,
 *   `.outbound` (agent or bot) to the left. `.body`: a flex column at most 75% wide, aligned to
 *   its side.
 * - `.text`: padding 12px, `white-space: pre-wrap`, `word-break: break-word`. Inbound: primary
 *   background, `--chat-on-primary` text, radius `8px 0 8px 8px`, links in the text colour.
 *   Outbound: `#ececec`, `#000` text, radius `0 8px 8px 8px`. `.answers`: small, `#757575`,
 *   right-aligned for inbound. `.pending` at reduced opacity.
 * - `.avatar`: 40px circle, `align-self: flex-end`, 6px to its right and 4px below; an `img`
 *   covers it; a letter fallback is white on `#bdbdbd`.
 * - `.caption` and `.note.sent`: caption size (about 12.9px), `#757575`; inbound and `sent`
 *   right-aligned; an agent caption indented to clear the avatar when one is shown.
 * - `.note.intro`, `.note.day`, `.presence`: centred captions, `#757575`, `white-space:
 *   pre-wrap`; `.presence.ended` stacks its lines with no margins.
 * - `mark` `#b5e2e8`; `pre` 9px padding, 1px solid border, 4px radius; `code` monospace.
 *   Attachment images up to 14rem, first corner radius 7px.
 * - `.typing`: an outbound-style bubble (`#ececec`, radius `0 8px 8px 8px`, padding `10px 12px`,
 *   margin `0 16px 6px`, as wide as its content) holding three `.dot`s: 6px circles of `#757575`,
 *   1px margin, `1.5s ease-in-out infinite` keyframes that lift 35% and half-fade at 15% and
 *   return at 30%, delayed 0, 150 and 300ms; no animation under `prefers-reduced-motion: reduce`.
 * - `.quick-replies`: wraps, right-aligned, 8px gaps, padding `6px 16px`; its buttons are MUI
 *   outlined chips: 32px tall, 16px radius, 1px `#757575` border, transparent, text colour,
 *   `#ececec` on hover and focus; a chip `img` 24px round.
 */
export const transcriptStyles = `
.status[role='status'], .session-warning {
  margin: 0; padding: 4px 16px; text-align: center; font-size: 12.9px; color: #757575;
}
.status[role='status']:empty, .session-warning:empty { padding: 0; }
.notice {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 8px 16px; color: #b00020; background: #fbe9ec;
}
.notice button { border-color: currentColor; color: inherit; }
.scroller {
  flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column;
  padding: 0 16px 6px;
}
@media (prefers-reduced-motion: no-preference) {
  .scroller { scroll-behavior: smooth; }
}
.history {
  align-self: center; margin: 8px 0; padding: 6px 8px; border: 0; background: transparent;
  color: var(--chat-primary);
}
.history-note { align-self: center; margin: 8px 0; font-size: 12.9px; color: #757575; }
fieldset.answer-gate { display: contents; }
ol.transcript { list-style: none; margin: auto 0 0; padding: 0; }
.message { display: flex; margin: 0 0 4px; padding-top: 6px; }
.message.inbound + .message.inbound, .message.outbound + .message.outbound { padding-top: 0; }
.message.inbound { justify-content: flex-end; }
.message .body { display: flex; flex-direction: column; max-width: 75%; min-width: 0; }
.message.inbound .body { align-items: flex-end; }
.message.outbound .body { align-items: flex-start; }
.message .text { padding: 12px; white-space: pre-wrap; word-break: break-word; }
.message .text > :first-child { margin-top: 0; }
.message .text > :last-child { margin-bottom: 0; }
.message.inbound .text {
  background: var(--chat-primary); color: var(--chat-on-primary); border-radius: 8px 0 8px 8px;
}
.message.inbound .text a { color: inherit; }
.message.outbound .text { background: #ececec; color: #000000; border-radius: 0 8px 8px 8px; }
.message .answers {
  list-style: none; margin: 4px 0 0; padding: 0; font-size: 12.9px; color: #757575;
}
.message.inbound .answers { text-align: right; }
.message.pending { opacity: 0.7; }
.message .avatar {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  align-self: flex-end; width: 40px; height: 40px; margin: 0 6px 4px 0; overflow: hidden;
  border-radius: 50%; background: #bdbdbd; color: #ffffff; font-size: 20px;
}
.message .avatar img { width: 100%; height: 100%; object-fit: cover; }
.message .caption, .note.sent { margin: 4px 0 0; font-size: 12.9px; color: #757575; }
.message.inbound .caption, .note.sent { text-align: right; }
.note.sent { margin: 0 0 4px; }
.note.intro, .note.day, .presence {
  margin: 0 0 4px; padding-top: 6px; text-align: center; font-size: 12.9px; color: #757575;
  white-space: pre-wrap;
}
.presence.ended { display: flex; flex-direction: column; align-items: center; }
.presence.ended p { margin: 0; }
mark { background: #b5e2e8; color: rgba(0, 0, 0, 0.87); }
pre {
  margin: 4px 0; padding: 9px; border: 1px solid; border-radius: 4px; white-space: pre-wrap;
  overflow-x: auto;
}
code { font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace; }
.attachment img {
  display: block; max-width: 14rem; max-height: 14rem; border-radius: 7px;
}
.typing {
  display: flex; align-items: center; align-self: flex-start; width: fit-content;
  margin: 0 16px 6px; padding: 10px 12px; background: #ececec; border-radius: 0 8px 8px 8px;
}
.typing .dot {
  display: block; width: 6px; height: 6px; margin: 1px; border-radius: 50%;
  background: #757575;
}
@media (prefers-reduced-motion: no-preference) {
  .typing .dot { animation: chat-typing-dot 1.5s ease-in-out infinite; }
  .typing .dot + .dot { animation-delay: 150ms; }
  .typing .dot + .dot + .dot { animation-delay: 300ms; }
}
@keyframes chat-typing-dot {
  15% { transform: translateY(-35%); opacity: 0.5; }
  30% { transform: translateY(0); opacity: 1; }
}
.quick-replies {
  display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; padding: 6px 16px;
}
.quick-replies button {
  display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 12px;
  border: 1px solid #757575; border-radius: 16px; background: transparent;
  color: rgba(0, 0, 0, 0.87); font-size: 13.9px; font-weight: 400; line-height: 1;
}
.quick-replies button:hover, .quick-replies button:focus-visible { background: #ececec; }
.quick-replies img {
  width: 24px; height: 24px; margin-left: -8px; border-radius: 50%; object-fit: cover;
}
`;