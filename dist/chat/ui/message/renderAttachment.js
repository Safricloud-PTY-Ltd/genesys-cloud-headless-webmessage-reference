import { toSafeUrl } from "../../core/index.js";
import { renderExternalLink } from "../renderExternalLink.js";
import { strings } from "../strings.js";
/**
 * Shows one attachment inside a message bubble.
 *
 * @param attachment - The attachment. Its `url` is untrusted and expires.
 * @param context - Document and dispatch.
 * @returns For an `Image` whose `url` passes `toSafeUrl(url, ['https:'])`: an `<a>` to the URL
 *   (new tab, `rel="noopener noreferrer"`) wrapping an `<img>` with `alt` = the file name (or
 *   `strings.attachment`) and `loading="lazy"`; when the image fails to load it dispatches
 *   `{ kind: 'refreshAttachment', attachmentId }` once, but only when `refreshedAt` is absent: a
 *   URL already refreshed through `getFile` that still fails is left as is, its link and `alt`
 *   text being the fallback, which bounds automatic refreshes even though each refresh rebuilds
 *   the row. For anything else with a safe https URL: an
 *   `<a>` (new tab) whose text is the file name or `strings.attachment`, and whose `click` also
 *   dispatches `{ kind: 'refreshAttachment', attachmentId }` (navigation still happens), so a
 *   link that has expired is fresh on the next try. Without a safe URL: a
 *   `<span>` with that text.
 * @remarks Sets no `innerHTML`. The element carries `class="attachment"`.
 */
export const renderAttachment = (attachment, context) => {
    const { document } = context;
    const label = attachment.filename ?? strings.attachment;
    const href = attachment.url === undefined ? undefined : toSafeUrl(attachment.url, ['https:']);
    if (href === undefined) {
        const span = document.createElement('span');
        span.className = 'attachment';
        span.textContent = label;
        return span;
    }
    if (attachment.mediaType !== 'Image') {
        const link = renderExternalLink(document, href, [label]);
        link.classList.add('attachment');
        // The URL may have expired; navigation goes ahead, and the refresh makes the next try fresh.
        link.addEventListener('click', () => {
            context.dispatch({ kind: 'refreshAttachment', attachmentId: attachment.id });
        });
        return link;
    }
    const image = document.createElement('img');
    image.setAttribute('src', href);
    image.setAttribute('alt', label);
    image.setAttribute('loading', 'lazy');
    // Attachment URLs expire, so a failed load asks for a fresh URL rather than showing a broken image.
    // A URL that was already refreshed and still fails is left alone, so refreshes cannot loop.
    if (attachment.refreshedAt === undefined) {
        image.addEventListener('error', () => {
            context.dispatch({ kind: 'refreshAttachment', attachmentId: attachment.id });
        }, { once: true });
    }
    const link = renderExternalLink(document, href, [image]);
    link.classList.add('attachment');
    return link;
};