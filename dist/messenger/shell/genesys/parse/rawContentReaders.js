import { parseAttachment } from "./parseAttachment.js";
import { parseCarousel } from "./parseCarousel.js";
import { parseDatePicker } from "./parseDatePicker.js";
import { parseForm } from "./parseForm.js";
import { parseListPicker } from "./parseListPicker.js";
import { parseQuickReply } from "./parseQuickReply.js";
import { parseRawCard } from "./parseRawCard.js";
/**
 * How each raw `contentType` is read: the reader takes the content item and returns its
 * `Content`, or `undefined` when the matching property doesn't parse. One row per kind:
 * `Attachment` (`parseAttachment(item.attachment)`), `QuickReply`
 * (`parseQuickReply(item.quickReply, 'image')`), `Card` (`parseRawCard(item.card)`), the deprecated
 * `GenericTemplate` (`parseRawCard(item.generic)`, as a `Card`, which is how the SDK formats it), `Carousel`
 * (`parseCarousel(item.carousel, parseRawCard)`), `DatePicker`, `ListPicker` and `Form` (their
 * parsers on `item.datePicker`, `item.listPicker`, `item.form`). A `Map`, so a `contentType` like
 * `toString` finds nothing. Used by `parseRawContent`; tested through it.
 *
 * @param item - The raw content item, already narrowed to a record.
 * @returns The item's `Content`, or `undefined` when its matching property doesn't parse.
 */
export const rawContentReaders = new Map([
    [
        'Attachment',
        (item) => {
            const attachment = parseAttachment(item['attachment']);
            return attachment && { kind: 'Attachment', attachment };
        },
    ],
    [
        'QuickReply',
        (item) => {
            const quickReply = parseQuickReply(item['quickReply'], 'image');
            return quickReply && { kind: 'QuickReply', quickReply };
        },
    ],
    [
        'Card',
        (item) => {
            const card = parseRawCard(item['card']);
            return card && { kind: 'Card', card };
        },
    ],
    [
        'GenericTemplate',
        (item) => {
            const card = parseRawCard(item['generic']);
            return card && { kind: 'Card', card };
        },
    ],
    [
        'Carousel',
        (item) => {
            const cards = parseCarousel(item['carousel'], parseRawCard);
            return cards && { kind: 'Carousel', cards };
        },
    ],
    [
        'DatePicker',
        (item) => {
            const datePicker = parseDatePicker(item['datePicker']);
            return datePicker && { kind: 'DatePicker', datePicker };
        },
    ],
    [
        'ListPicker',
        (item) => {
            const listPicker = parseListPicker(item['listPicker']);
            return listPicker && { kind: 'ListPicker', listPicker };
        },
    ],
    [
        'Form',
        (item) => {
            const form = parseForm(item['form']);
            return form && { kind: 'Form', form };
        },
    ],
]);