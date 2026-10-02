/**
 * Checks a URL from message content before it becomes a link or an image source. Agent and bot
 * content is untrusted (structured-messages.md, "Rendering checklist").
 *
 * @param url - Untrusted text, surrounding whitespace allowed.
 * @param schemes - Allowed schemes with their colon, lower-case: `['https:', 'http:', 'mailto:']`
 *   for links, `['https:']` for images.
 * @returns The URL as `new URL(url).href` normalises it, when it is absolute and its scheme is in
 *   `schemes`; otherwise `undefined` (relative URLs, `javascript:`, `data:`, unparseable text).
 * @remarks Pure.
 */
export const toSafeUrl = (url, schemes) => {
    const trimmed = url.trim();
    if (!URL.canParse(trimmed))
        return undefined;
    const parsed = new URL(trimmed);
    return schemes.includes(parsed.protocol) ? parsed.href : undefined;
};