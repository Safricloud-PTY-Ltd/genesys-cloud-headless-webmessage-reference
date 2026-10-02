import { isRecord, readArray, readRecord, readString } from '#shared';
/**
 * Reads the reply facts of a message in the SDK's formatted shape (history).
 *
 * @param message - The formatted message, already narrowed to a record.
 * @returns `replyTo` from the first non-empty of: top-level `parentMessageId`;
 *   `payload[].originatingMessageId` (list picker replies); `form.originatingMessageId` (form
 *   replies). `fallbackText`: the non-empty `text` of each `payload[]` record joined with
 *   `", "`; when there are none, every non-empty `form.response[].component.buttonResponse.text`
 *   joined with `", "`; else `""`. `answers`: the same texts as a list, before joining (`[]` when
 *   there are none).
 * @remarks Pure.
 */
export const parseFormattedReply = (message) => {
    const options = readArray(message, 'payload').filter(isRecord);
    const form = readRecord(message, 'form') ?? {};
    const replyTo = [
        readString(message, 'parentMessageId'),
        ...options.map((option) => readString(option, 'originatingMessageId')),
        readString(form, 'originatingMessageId'),
    ].find((id) => id !== undefined && id !== '');
    const optionTexts = options
        .map((option) => readString(option, 'text') ?? '')
        .filter((text) => text !== '');
    const formTexts = readArray(form, 'response')
        .filter(isRecord)
        .map((response) => readRecord(readRecord(response, 'component') ?? {}, 'buttonResponse') ?? {})
        .map((reply) => readString(reply, 'text') ?? '')
        .filter((text) => text !== '');
    const answers = optionTexts.length > 0 ? optionTexts : formTexts;
    const fallbackText = answers.join(', ');
    return replyTo === undefined
        ? { answers, fallbackText }
        : { replyTo: replyTo, answers, fallbackText };
};