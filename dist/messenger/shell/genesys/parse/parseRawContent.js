import { isRecord, readString } from '#shared';
import { rawContentReaders } from "./rawContentReaders.js";
/**
 * Reads one raw Guest API content item (`content[]` in `messagesReceived`) by `contentType`.
 *
 * @param value - Untrusted: `{ contentType, attachment | quickReply | card | carousel |
 *   datePicker | listPicker | form }`.
 * @returns `Attachment` via `parseAttachment`; `QuickReply` from `quickReply.{text, payload,
 *   image?}` (a missing `payload` takes `text`; no `text`, no item); `Card` via `parseRawCard`;
 *   `Carousel` from `carousel.cards` via `parseRawCard`, keeping valid cards; `DatePicker` via
 *   `parseDatePicker`; `ListPicker` via `parseListPicker`; `Form` via `parseForm`. `undefined` for
 *   a malformed item, a carousel with no valid card, a `ButtonResponse` (an answer is shown as
 *   its message's text), a form reply, and any other `contentType`.
 * @remarks Pure.
 */
export const parseRawContent = (value) => {
    if (!isRecord(value))
        return undefined;
    // An item with no contentType reads as '', which no reader handles.
    const read = rawContentReaders.get(readString(value, 'contentType') ?? '');
    return read?.(value);
};