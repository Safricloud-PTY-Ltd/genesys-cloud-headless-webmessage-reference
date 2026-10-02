/**
 * The part of a demo message body that depends on what it carries.
 *
 * @param fields - The message.
 * @returns With `presence`: `{ type: 'Event', events: [{ eventType: 'Presence', presence: { type:
 *   presence } }] }`. Otherwise `type` `Structured` when there is content, else `Text`, with `text`
 *   and `content` when given.
 * @remarks Pure. Part of `rawMessage`; tested through it.
 */
export const rawPayload = (fields) => {
    if (fields.presence !== undefined) {
        return {
            type: 'Event',
            events: [{ eventType: 'Presence', presence: { type: fields.presence } }],
        };
    }
    const hasContent = (fields.content ?? []).length > 0;
    return {
        type: hasContent ? 'Structured' : 'Text',
        ...(fields.text === undefined ? {} : { text: fields.text }),
        ...(hasContent ? { content: fields.content } : {}),
    };
};