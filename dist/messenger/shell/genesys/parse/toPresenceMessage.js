import { err, ok } from '#shared';
import { invalidPayload } from "../../../types.js";
/**
 * Finishes a presence-event message.
 *
 * @param base - Everything but text, content and presence.
 * @param presence - The presence type found, if any.
 * @returns The message with empty `text` and `content` and the `presence`.
 * @errors InvalidPayload (source `message`) - when `presence` is `undefined`.
 * @remarks Pure. Part of the message parsers; tested through them.
 */
export const toPresenceMessage = (base, presence) => {
    return presence === undefined
        ? err(invalidPayload('message', 'event without a known presence type'))
        : ok({ ...base, text: '', content: [], presence });
};