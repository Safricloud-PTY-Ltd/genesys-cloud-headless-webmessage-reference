import { toSafeUrl } from "../../core/index.js";
import { strings } from "../strings.js";
/**
 * Shows quick-reply chips under the transcript.
 *
 * @param replies - From `latestQuickReplies`. May be empty.
 * @param context - Document and dispatch.
 * @returns A `<div class="quick-replies" role="group" aria-label>` (`strings.quickRepliesLabel`)
 *   with one `<button type="button">` per reply, labelled with its text (and a decorative image
 *   when `image` is a safe https URL). Clicking dispatches `{ kind: 'postback', postback: { kind:
 *   'quickReply', text, payload } }` once: after a dispatch every chip is marked
 *   `aria-disabled="true"` and clicks do nothing, until the group is redrawn (Enter auto-repeat or a
 *   double click would otherwise send twice). Empty `replies` give an empty, `hidden` element.
 * @remarks Sets no `innerHTML`.
 */
export const renderQuickReplies = (replies, context) => {
    const { document } = context;
    const group = document.createElement('div');
    group.className = 'quick-replies';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', strings.quickRepliesLabel);
    group.hidden = replies.length === 0;
    const buttons = replies.map((reply) => {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        const imageUrl = reply.image === undefined ? undefined : toSafeUrl(reply.image, ['https:']);
        if (imageUrl !== undefined) {
            const image = document.createElement('img');
            image.setAttribute('src', imageUrl);
            image.setAttribute('alt', '');
            button.append(image);
        }
        button.append(reply.text);
        button.addEventListener('click', () => {
            if (button.getAttribute('aria-disabled') === 'true')
                return;
            context.dispatch({
                kind: 'postback',
                postback: { kind: 'quickReply', text: reply.text, payload: reply.payload },
            });
            group.querySelectorAll('button').forEach((chip) => {
                chip.setAttribute('aria-disabled', 'true');
            });
        });
        return button;
    });
    group.append(...buttons);
    return group;
};