import { toSafeUrl } from "../../core/index.js";
import { renderStepHeading } from "./renderStepHeading.js";
/**
 * The content of a form's introduction step.
 *
 * @param introduction - The form's introduction.
 * @param document - The document to create elements with.
 * @returns `renderStepHeading(title, subtitle)`, then an `<img alt="">` when `image` passes
 *   `toSafeUrl(image, ['https:'])`.
 * @remarks Sets no `innerHTML`. Part of `<chat-form>`; tested through it.
 */
export const renderFormIntro = (introduction, document) => {
    const heading = renderStepHeading(introduction.title, introduction.subtitle, document);
    const src = introduction.image === undefined ? undefined : toSafeUrl(introduction.image, ['https:']);
    if (src === undefined)
        return heading;
    const image = document.createElement('img');
    image.src = src;
    image.alt = '';
    return [...heading, image];
};