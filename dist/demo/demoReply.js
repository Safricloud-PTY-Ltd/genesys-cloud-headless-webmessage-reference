import { demoContent } from "./demoContent.js";
/**
 * Chooses the demo bot's answer to what the customer said. Each keyword shows off one kind of
 * content, so the demo (and the e2e suite) can reach every renderer.
 *
 * @param text - The customer's message or quick-reply payload; matched case-insensitively against
 *   the first keyword it contains.
 * @param now - Epoch ms, for date picker slots.
 * @returns For `card`, `carousel`, `date`, `list`, `form`, `markdown`, `file`: the matching
 *   item from `demoContent` (`date`: a date picker whose slots are the next three days at 09:00,
 *   11:30 and 14:00 UTC, 1800 s each); for `bye`: a goodbye text with `disconnect`; otherwise the
 *   menu: a text listing the keywords and one quick reply per keyword.
 * @remarks Pure.
 */
export const demoReply = (text, now) => {
    const lower = text.toLowerCase();
    const keyword = demoContent.keywords
        .map((candidate) => ({ candidate, at: lower.indexOf(candidate) }))
        .filter(({ at }) => at >= 0)
        .toSorted((a, b) => a.at - b.at)[0]?.candidate;
    if (keyword === 'bye')
        return { text: demoContent.goodbye, content: [], disconnect: true };
    if (keyword === 'markdown')
        return { text: demoContent.markdown, content: [], disconnect: false };
    if (keyword === 'date') {
        const dayMs = 86_400_000;
        const midnight = Math.floor(now / dayMs) * dayMs;
        const availableTimes = [1, 2, 3].flatMap((day) => [9, 11.5, 14].map((hour) => ({
            dateTime: new Date(midnight + day * dayMs + hour * 3_600_000).toISOString(),
            duration: 1800,
        })));
        const datePicker = { title: 'Pick a time for your appointment', availableTimes };
        return { content: [{ contentType: 'DatePicker', datePicker }], disconnect: false };
    }
    if (keyword !== undefined)
        return { content: [demoContent[keyword]], disconnect: false };
    return {
        text: `${demoContent.menu} ${demoContent.keywords.join(', ')}`,
        content: demoContent.keywords.map((option) => ({
            contentType: 'QuickReply',
            quickReply: { text: option, payload: option, action: 'Message' },
        })),
        disconnect: false,
    };
};