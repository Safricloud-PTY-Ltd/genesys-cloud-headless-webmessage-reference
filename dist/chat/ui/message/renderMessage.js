import { parseRichText } from "../../core/index.js";
import { renderRichText } from "../richText/index.js";
import { renderAnswers } from "./renderAnswers.js";
import { renderAvatar } from "./renderAvatar.js";
import { renderCaption } from "./renderCaption.js";
import { renderContent } from "./renderContent.js";
import { renderPresence } from "./renderPresence.js";
import { senderName } from "./senderName.js";
/**
 * Shows one transcript entry, laid out as native Messenger's bubbles.
 *
 * @param message - The message.
 * @param context - The render context.
 * @returns A presence message as `renderPresence(message, context)`. Any other message as an
 *   `<li>` with `class` `message inbound` or `message outbound` (by direction) holding, in order:
 *   a visually hidden `<span>` of `senderName(message, context)`; `renderAvatar(message, context)`
 *   when defined; and a `<div class="body">` holding
 *   - the text, when non-empty, as `renderRichText(parseRichText(text, { markdown:
 *     context.markdown, direction }))` in a `<div class="text" dir="auto">` whose `title` is
 *     `context.formatTime(time)` (native shows the time as a tooltip on the bubble);
 *   - when `answers` is non-empty, a `<ul class="answers">` with one `<li dir="auto">` of plain
 *     text per answer, in order;
 *   - each `renderContent` result, in order;
 *   - the caption: with `context.humanize.enabled`, a `<p class="caption">` reading
 *     `senderName + ' · '` followed by a `<time>`; otherwise that `<time>` alone, with class
 *     `visually-hidden` (native shows no time under bubbles without humanize). The `<time>` has
 *     `datetime` = the ISO time and text `context.formatTime(time)`.
 * @remarks Sets no `innerHTML`.
 */
export const renderMessage = (message, context) => {
    const { document } = context;
    if (message.presence !== undefined) {
        return renderPresence(message, context);
    }
    const name = senderName(message, context);
    const item = document.createElement('li');
    item.className = message.direction === 'Inbound' ? 'message inbound' : 'message outbound';
    const label = document.createElement('span');
    label.className = 'visually-hidden';
    label.textContent = name;
    const avatar = renderAvatar(message, context);
    const body = document.createElement('div');
    body.className = 'body';
    item.append(label, ...(avatar === undefined ? [] : [avatar]), body);
    if (message.text !== '') {
        const text = document.createElement('div');
        text.className = 'text';
        text.setAttribute('dir', 'auto');
        text.setAttribute('title', context.formatTime(message.time));
        const options = { markdown: context.markdown, direction: message.direction };
        text.append(renderRichText(parseRichText(message.text, options), document));
        body.append(text);
    }
    body.append(...renderAnswers(message.answers, document), ...message.content
        .map((content) => renderContent(message.id, content, context))
        .filter((element) => element !== undefined));
    body.append(renderCaption(message, context));
    return item;
};