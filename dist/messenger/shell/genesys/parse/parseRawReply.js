import { isRecord, readArray, readRecord, readString } from '#shared';
/**
 * Reads the reply facts of a raw Guest API body (an echo in `messagesReceived`).
 *
 * @param message - The raw body, already narrowed to a record.
 * @returns `replyTo` from the first non-empty of: `metadata.parentMessageId`;
 *   `content[].buttonResponse.originatingMessageId`; `content[].form.originatingMessageId`.
 *   `fallbackText`: the non-empty `buttonResponse.text` of every `ButtonResponse` item joined
 *   with `", "`; when there are none, every non-empty `response[].component.buttonResponse.text`
 *   of a `Form` item joined with `", "`; else `""`. `answers`: the same texts as a list, before
 *   joining (`[]` when there are none).
 * @remarks Pure. Answers to quick replies and cards have no `replyTo`; only their text matters.
 */
export const parseRawReply = (message) => {
    const items = readArray(message, 'content').filter(isRecord);
    const buttons = items.map((item) => readRecord(item, 'buttonResponse')).filter(isRecord);
    const forms = items.map((item) => readRecord(item, 'form')).filter(isRecord);
    const replyTo = [
        readString(readRecord(message, 'metadata') ?? {}, 'parentMessageId'),
        ...buttons.map((button) => readString(button, 'originatingMessageId')),
        ...forms.map((form) => readString(form, 'originatingMessageId')),
    ].find((id) => id !== undefined && id !== '');
    const buttonTexts = buttons
        .map((button) => readString(button, 'text') ?? '')
        .filter((text) => text !== '');
    const formTexts = forms
        .flatMap((form) => readArray(form, 'response'))
        .filter(isRecord)
        .map((response) => readRecord(readRecord(response, 'component') ?? {}, 'buttonResponse') ?? {})
        .map((reply) => readString(reply, 'text') ?? '')
        .filter((text) => text !== '');
    const answers = buttonTexts.length > 0 ? buttonTexts : formTexts;
    const fallbackText = answers.join(', ');
    return replyTo === undefined
        ? { answers, fallbackText }
        : { replyTo: replyTo, answers, fallbackText };
};