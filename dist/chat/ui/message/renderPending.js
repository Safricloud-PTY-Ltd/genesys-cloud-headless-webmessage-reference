import { parseRichText } from "../../core/index.js";
import { renderRichText } from "../richText/index.js";
import { strings } from "../strings.js";
/**
 * Shows a message the customer sent that hasn't echoed back yet.
 *
 * @param pending - The pending message.
 * @param context - The render context.
 * @returns An `<li class="message inbound pending">` holding a visually hidden `strings.you`, then a
 *   `<div class="body">` with: the text as rich text (inbound) in a `<div class="text"
 *   dir="auto">` when non-empty; a `<span class="attachment">` of `strings.attachment` per
 *   attachment id; and a `<p class="caption sending">` of `strings.sending`, where a sent message
 *   shows its caption.
 * @remarks Sets no `innerHTML`.
 */
export const renderPending = (pending, context) => {
    const { document } = context;
    const item = document.createElement('li');
    item.className = 'message inbound pending';
    const label = document.createElement('span');
    label.className = 'visually-hidden';
    label.textContent = strings.you;
    const body = document.createElement('div');
    body.className = 'body';
    item.append(label, body);
    if (pending.text !== '') {
        const text = document.createElement('div');
        text.className = 'text';
        text.setAttribute('dir', 'auto');
        const options = { markdown: context.markdown, direction: 'Inbound' };
        text.append(renderRichText(parseRichText(pending.text, options), document));
        body.append(text);
    }
    body.append(...pending.attachmentIds.map(() => {
        const attachment = document.createElement('span');
        attachment.className = 'attachment';
        attachment.textContent = strings.attachment;
        return attachment;
    }));
    const sending = document.createElement('p');
    sending.className = 'caption sending';
    sending.textContent = strings.sending;
    body.append(sending);
    return item;
};