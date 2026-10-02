import { senderName } from "./senderName.js";
/**
 * Draws the end of a bubble: who sent it and when, as native Messenger shows it.
 *
 * @param message - The message.
 * @param context - The document, `formatTime` and `humanize`.
 * @returns With `context.humanize.enabled`, a `<p class="caption">` reading
 *   `senderName(message, context) + ' · '` followed by a `<time>`; otherwise that `<time>` alone,
 *   with class `visually-hidden` (native shows no time under bubbles without humanize). The
 *   `<time>` has `datetime` = the ISO time and text `context.formatTime(time)`.
 * @remarks Sets no `innerHTML`. Part of `renderMessage`; tested through it.
 */
export const renderCaption = (message, context) => {
    const { document } = context;
    const stamp = document.createElement('time');
    stamp.setAttribute('datetime', new Date(message.time).toISOString());
    stamp.textContent = context.formatTime(message.time);
    if (!context.humanize.enabled) {
        stamp.className = 'visually-hidden';
        return stamp;
    }
    const caption = document.createElement('p');
    caption.className = 'caption';
    caption.append(`${senderName(message, context)} · `, stamp);
    return caption;
};