/**
 * Structured content inside the transcript: cards, carousels, date and list pickers, form
 * launchers and `<chat-form>`. Native's card metrics are only partly measured
 * (docs/guides/native-messenger-ui.md, "Cards and carousels"), so these follow its visual
 * language: white surfaces, 8px radii, grey borders, contained primary buttons.
 *
 * Must hold, for the class names the message renderers and `<chat-form>` use today (`.card`,
 * `.carousel`, `.date-picker`, `.slots`, `.list-picker`, `.form-launcher`, `.field`, `.error`,
 * `.form-nav`, `.form-summary`, `.attachment`, `fieldset`, `legend`):
 * - `.card`, `.date-picker`, `.list-picker`, `.form-launcher`: white, 1px `#ececec` border, 8px
 *   radius, MUI elevation-1 shadow, 12px padding, a flex column with 8px gaps, at most 18rem
 *   wide; headings 15px weight 600; descriptions and card dates `#757575`; card images full width
 *   with the top corners rounded.
 * - `.carousel`: a horizontal scroller of 15rem cards with 8px gaps.
 * - Buttons inside them are the shared contained/outlined buttons; slot buttons wrap with 6px
 *   gaps; list-picker subtitles indented and `#757575`.
 * - Form fields: label above control, controls with a 1px `#8a8a8a` border, 4px radius, 8px
 *   padding; `[aria-invalid='true']` and `.error` in `#b00020`; an empty `.error` takes no space;
 *   `.form-nav` right-aligned with 8px gaps; summary `dt` weight 600.
 */
export const structuredStyles = `
.card, .date-picker, .list-picker, .form-launcher {
  display: flex; flex-direction: column; gap: 8px; max-width: 18rem; margin-top: 4px;
  padding: 12px; border: 1px solid #ececec; border-radius: 8px; background: #ffffff;
  color: rgba(0, 0, 0, 0.87);
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
}
:is(.card, .date-picker, .list-picker, .form-launcher) :is(h3, h4) {
  margin: 0; font-size: 15px; font-weight: 600;
}
:is(.card, .date-picker, .list-picker, .form-launcher) p { margin: 0; color: #757575; }
:is(.card, .date-picker, .list-picker, .form-launcher) .subtitle { margin: 0; color: #757575; }
.card { overflow: hidden; }
.card > img {
  display: block; width: calc(100% + 24px); max-width: none; margin: -12px -12px 0;
  border-radius: 7px 7px 0 0;
}
.card time { font-size: 0.75rem; color: #757575; }
.card button, .card > a {
  display: block; width: 100%; padding: 6px 16px; border: 0; border-radius: 4px;
  background: var(--chat-primary); color: var(--chat-on-primary); font-weight: 500;
  text-align: center; text-decoration: none;
}
.card > a:focus-visible { outline-offset: -3px; }
.form-launcher img { display: block; max-width: 100%; border-radius: 4px; }
.carousel {
  display: flex; gap: 8px; max-width: 100%; margin-top: 4px; padding: 2px 2px 6px;
  overflow-x: auto;
}
.carousel .card { flex: 0 0 15rem; margin-top: 0; }
.date-picker .day { display: flex; flex-direction: column; gap: 6px; }
.slots { display: flex; flex-wrap: wrap; gap: 6px; }
fieldset {
  display: flex; flex-direction: column; gap: 4px; min-width: 0; margin: 0; padding: 0;
  border: 0;
}
legend { margin-bottom: 4px; padding: 0; font-weight: 600; }
.list-picker label { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 8px; }
.list-picker label .subtitle { flex-basis: 100%; padding-inline-start: 21px; font-size: 12.9px; }
chat-form { display: flex; flex-direction: column; gap: 8px; }
.field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.field :where(input:not([type='checkbox']):not([type='radio']), textarea, select) {
  font: inherit; padding: 8px; border: 1px solid #8a8a8a; border-radius: 4px;
  background: #ffffff; color: inherit;
}
.field .hint { margin: 0; font-size: 12.9px; color: #757575; }
.field [aria-invalid='true'] { border-color: #b00020; }
.error { margin: 0; font-size: 12.9px; color: #b00020; }
.error:empty { display: none; }
.form-nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.form-summary { margin: 0; }
.form-summary dt { font-weight: 600; }
.form-summary dd { margin: 0 0 8px; }
.attachment { display: inline-block; max-width: 100%; margin-top: 4px; overflow-wrap: anywhere; }
`;