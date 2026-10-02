/**
 * Lists the attachments a set of messages carries.
 *
 * @param messages - Any messages. May be empty.
 * @returns The `id` of every `Attachment` content item, in message then content order, each id
 *   once (the first occurrence kept).
 * @remarks Pure.
 */
export const attachmentIdsOf = (messages) => {
    const ids = messages.flatMap((message) => message.content.flatMap((item) => (item.kind === 'Attachment' ? [item.attachment.id] : [])));
    return ids.filter((id, index) => ids.indexOf(id) === index);
};