import { renderAttachment } from "./renderAttachment.js";
import { renderCard } from "./renderCard.js";
import { renderDatePicker } from "./renderDatePicker.js";
import { renderFormLauncher } from "./renderFormLauncher.js";
import { renderListPicker } from "./renderListPicker.js";
/**
 * Shows one item of a message's rich content.
 *
 * @param messageId - The message the content belongs to (pickers and forms answer to it).
 * @param content - The item.
 * @param context - The render context.
 * @returns `Attachment` → `renderAttachment`; `Card` → `renderCard`; `Carousel` → a
 *   `<div class="carousel" role="group">` holding `renderCard` per card; `DatePicker` →
 *   `renderDatePicker`; `ListPicker` → `renderListPicker`; `Form` → `renderFormLauncher`;
 *   `QuickReply` → `undefined` (quick replies are shown under the transcript, not in the bubble).
 * @remarks Sets no `innerHTML`.
 */
export const renderContent = (messageId, content, context) => {
    switch (content.kind) {
        case 'Attachment':
            return renderAttachment(content.attachment, context);
        case 'Card':
            return renderCard(content.card, context);
        case 'Carousel': {
            const carousel = context.document.createElement('div');
            carousel.className = 'carousel';
            carousel.setAttribute('role', 'group');
            carousel.append(...content.cards.map((card) => renderCard(card, context)));
            return carousel;
        }
        case 'DatePicker':
            return renderDatePicker(messageId, content.datePicker, context);
        case 'ListPicker':
            return renderListPicker(messageId, content.listPicker, context);
        case 'Form':
            return renderFormLauncher(messageId, content.form, context);
        case 'QuickReply':
            return undefined;
    }
};