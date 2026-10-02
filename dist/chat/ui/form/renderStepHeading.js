/**
 * The heading of a form step, which takes focus when the step is shown.
 *
 * @param title - The step title.
 * @param subtitle - Shown under it when non-empty.
 * @param document - The document to create elements with.
 * @returns An `<h3 tabindex="-1">` with the title, then a `<p class="subtitle">` when there is a
 *   subtitle.
 * @remarks Sets no `innerHTML`. Part of `<chat-form>`; tested through it.
 */
export const renderStepHeading = (title, subtitle, document) => {
    const heading = document.createElement('h3');
    heading.setAttribute('tabindex', '-1');
    heading.textContent = title;
    if (subtitle === undefined || subtitle === '')
        return [heading];
    const text = document.createElement('p');
    text.className = 'subtitle';
    text.textContent = subtitle;
    return [heading, text];
};