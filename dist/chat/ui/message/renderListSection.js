import { renderListItem } from "./renderListItem.js";
/**
 * Builds one section of a list picker: a titled group of choices.
 *
 * @param document - The document to create elements with.
 * @param name - The input name the section's choices share; unique to the message and section.
 * @param section - The section.
 * @returns A `<fieldset>` with a `<legend>` holding the section title and one `renderListItem` per
 *   item, of type `checkbox` when `multipleSelection`, otherwise `radio`, all named `name`.
 * @remarks Sets no `innerHTML`. Part of `renderListPicker`; tested through it.
 */
export const renderListSection = (document, name, section) => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = section.title;
    const type = section.multipleSelection ? 'checkbox' : 'radio';
    fieldset.append(legend, ...section.items.map((item) => renderListItem(document, item, { type, name })));
    return fieldset;
};