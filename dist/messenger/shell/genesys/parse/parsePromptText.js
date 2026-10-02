import { readRecord, readString } from '#shared';
/**
 * Reads the prompt card and reply text of a list picker or form.
 *
 * @param content - The `listPicker` or `form` record.
 * @param replyField - Which `replyMessage` field the answer's text comes from: `subtitle` for a
 *   list picker, `title` for a form (docs/guides/structured-messages.md).
 * @returns `title`, `subtitle` and `image` from `receivedMessage.{title, subtitle, imageUrl}`
 *   (`title` `""` when absent; empty optionals omitted), and `replyText` from
 *   `replyMessage[replyField]`, `""` when absent.
 * @remarks Pure.
 */
export const parsePromptText = (content, replyField) => {
    const received = readRecord(content, 'receivedMessage') ?? {};
    const reply = readRecord(content, 'replyMessage') ?? {};
    const subtitle = readString(received, 'subtitle');
    const image = readString(received, 'imageUrl');
    return {
        title: readString(received, 'title') ?? '',
        ...(subtitle ? { subtitle } : {}),
        ...(image ? { image } : {}),
        replyText: readString(reply, replyField) ?? '',
    };
};