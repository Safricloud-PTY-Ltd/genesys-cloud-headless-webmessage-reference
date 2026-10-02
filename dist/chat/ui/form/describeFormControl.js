import { strings } from "../strings.js";
/**
 * Adds a field's description and required-answer message, wired to its control for assistive tech.
 *
 * @param field - The field.
 * @param options - Document, invalid flag and id prefix.
 * @param control - The field's control, as built by its kind's builder.
 * @returns In order: an element holding the subtitle (when the field has one, and it is not a list
 *   picker — whose subtitle-less schema has none), and an element (`class="error"`) holding
 *   `strings.formRequired` when `invalid`; each with an id derived from `idPrefix` + `encodeURIComponent(field id)` (a field id is bot
 *   data, and whitespace in it would split the `aria-describedby` list). Sets
 *   the control's `aria-describedby` to their ids (space-separated; absent when there are none) and
 *   `aria-invalid="true"` when `invalid`.
 * @remarks Mutates `control`'s attributes, which the caller just created. Part of
 *   `renderFormField`; tested through it.
 */
export const describeFormControl = (field, options, control) => {
    const base = options.idPrefix + encodeURIComponent(field.id);
    const subtitle = 'subtitle' in field ? field.subtitle : undefined;
    const parts = [
        ...(subtitle === undefined ? [] : [{ id: `${base}-hint`, className: 'hint', text: subtitle }]),
        ...(options.invalid
            ? [{ id: `${base}-error`, className: 'error', text: strings.formRequired }]
            : []),
    ];
    const elements = parts.map((part) => {
        const element = options.document.createElement('p');
        element.id = part.id;
        element.className = part.className;
        element.textContent = part.text;
        return element;
    });
    if (elements.length > 0) {
        control.setAttribute('aria-describedby', elements.map((e) => e.id).join(' '));
    }
    if (options.invalid) {
        control.setAttribute('aria-invalid', 'true');
    }
    return elements;
};