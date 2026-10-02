/**
 * The composer at the bottom of the conversation screen. Numbers are from
 * docs/guides/native-messenger-ui.md ("Composer"); Genesys' CSS is never copied.
 *
 * Must hold:
 * - `chat-composer`: a block with a 1px `#8a8a8a` top border, `#333` while it contains focus.
 * - `textarea`: full width, no border, transparent, `padding: 19px 18px 16px`, the panel font,
 *   `resize: none`, at most four lines tall, placeholder at 0.65 opacity; on `:focus-visible` a
 *   2px primary outline inset by 2px (our WCAG addition; native shows only the border change).
 * - `.actions`: a row under the field: `.attach` at the start (4px in), `.send` at the end (6px
 *   in); both icon buttons in `rgba(0, 0, 0, 0.54)`, `.send` in primary while enabled and at
 *   `rgba(0, 0, 0, 0.26)` while `:disabled`.
 * - `.upload`: a row `0 16px 8px` with the file name (one line, ellipsis), the progress bar or
 *   the remove button. `.error`: `#b00020`, padding `0 16px 8px`, no space while empty.
 * - `.start-new`: native's read-only "Start new": a contained primary button, full width less
 *   16px margins.
 */
export const composerStyles = `
chat-composer { display: block; flex: none; border-top: 1px solid #8a8a8a; background: #ffffff; }
chat-composer:focus-within { border-top-color: #333333; }
chat-composer form { display: flex; flex-direction: column; margin: 0; }
chat-composer textarea {
  display: block; width: 100%; margin: 0; padding: 19px 18px 16px; border: 0; border-radius: 0;
  background: transparent; color: inherit; font: inherit; line-height: 1.1876;
  resize: none; field-sizing: content; min-height: calc(1.1876em + 35px);
  max-height: calc(4 * 1.1876em + 35px); overflow-y: auto;
}
chat-composer textarea::placeholder { color: inherit; opacity: 0.65; }
chat-composer textarea:focus-visible { outline: 2px solid var(--chat-primary); outline-offset: -2px; }
chat-composer .actions { display: flex; align-items: center; }
chat-composer .actions .icon-button { color: rgba(0, 0, 0, 0.54); }
chat-composer .attach { margin-inline-start: 4px; }
chat-composer .send { margin-inline: auto 6px; }
chat-composer .actions .send:enabled { color: var(--chat-primary); }
chat-composer .actions .send:disabled { color: rgba(0, 0, 0, 0.26); opacity: 1; }
chat-composer .upload { display: flex; align-items: center; gap: 8px; padding: 0 16px 8px; }
chat-composer .file-name {
  flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
chat-composer .upload progress { flex: 0 0 6rem; }
chat-composer :is(.error, [role='alert']) {
  display: block; margin: 0; padding: 0 16px 8px; font-size: 12.9px; color: #b00020;
}
chat-composer :is(.error, [role='alert']):empty { display: block; padding: 0; }
chat-composer .start-new { display: block; width: calc(100% - 32px); margin: 16px; }
`;