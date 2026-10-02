import { readArray } from '#shared';
import { parseCarousel } from "./parseCarousel.js";
import { parseDatePicker } from "./parseDatePicker.js";
import { parseForm } from "./parseForm.js";
import { parseFormattedCard } from "./parseFormattedCard.js";
import { parseFormattedFile } from "./parseFormattedFile.js";
import { parseListPicker } from "./parseListPicker.js";
import { parseQuickReply } from "./parseQuickReply.js";
/**
 * Collects the rich content of a message in the SDK's formatted shape, which spreads it over
 * fixed fields instead of a `content[]` list.
 *
 * @param message - A formatted message, already narrowed to a record.
 * @returns In this order: one `Attachment` per valid `files[]` item (`parseFormattedFile`); one
 *   `QuickReply` per `quickReplies[]` item with a non-empty `text` (`payload` defaults to `text`,
 *   non-empty `imageUrl` → `image`); a `Card` when `parseFormattedCard(card)` gives one; a
 *   `Carousel` when `carousel.cards` yields at least one card through `parseFormattedCard`; a
 *   `DatePicker` when `parseDatePicker(datePicker)` gives one; a `ListPicker` from `listPicker`
 *   and a `Form` from `form` likewise. Empty when there is nothing.
 * @remarks Pure. The formatted shape keeps only the last card of a message, so at most one
 *   `Card`. Replies to pickers and forms carry no picker or form here, so they yield nothing.
 */
export const parseFormattedContent = (message) => {
    const card = parseFormattedCard(message['card']);
    const cards = parseCarousel(message['carousel'], parseFormattedCard);
    const datePicker = parseDatePicker(message['datePicker']);
    const listPicker = parseListPicker(message['listPicker']);
    const form = parseForm(message['form']);
    return [
        ...readArray(message, 'files')
            .map((file) => parseFormattedFile(file))
            .filter((attachment) => attachment !== undefined)
            .map((attachment) => ({ kind: 'Attachment', attachment })),
        ...readArray(message, 'quickReplies')
            .map((item) => parseQuickReply(item, 'imageUrl'))
            .filter((quickReply) => quickReply !== undefined)
            .map((quickReply) => ({ kind: 'QuickReply', quickReply })),
        ...(card ? [{ kind: 'Card', card }] : []),
        ...(cards ? [{ kind: 'Carousel', cards }] : []),
        ...(datePicker ? [{ kind: 'DatePicker', datePicker }] : []),
        ...(listPicker ? [{ kind: 'ListPicker', listPicker }] : []),
        ...(form ? [{ kind: 'Form', form }] : []),
    ];
};