/**
 * Builds one choice of a list picker.
 *
 * @param document - The document to create elements with.
 * @param item - The choice.
 * @param input - The input's `type` (radio or checkbox) and `name`.
 * @param input.type - `radio` for a single-choice section, `checkbox` for a multiple-choice one.
 * @param input.name - The name the section's inputs share.
 * @returns A `<label>` wrapping an `<input>` of that type and name with `value` = item id, a
 *   `<span class="title">` with the title, and a `<span class="subtitle">` with the subtitle when
 *   there is one (styled onto its own line, so it reads apart from the title).
 * @remarks Sets no `innerHTML`. Part of `renderListPicker`; tested through it.
 */
export const renderListItem = (document, item, input) => {
    const label = document.createElement('label');
    const control = document.createElement('input');
    control.type = input.type;
    control.name = input.name;
    control.value = item.id;
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = item.title;
    label.append(control, title);
    if (item.subtitle !== undefined) {
        const subtitle = document.createElement('span');
        subtitle.className = 'subtitle';
        subtitle.textContent = item.subtitle;
        label.append(subtitle);
    }
    return label;
};