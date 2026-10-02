import { renderTranscriptNote } from "./renderTranscriptNote.js";
/**
 * A transcript row that isn't a message: the opening line, a date separator, or the Sent mark.
 *
 * @param document - The document `render` creates the row with.
 * @param key - The row's key (`intro`, `d:` + message id, `sent`).
 * @param note - The line to draw.
 * @param note.kind - Which line: `intro`, `day` or `sent`.
 * @param note.text - What it says.
 * @param note.signature - What makes the row redraw when it changes; the Sent mark is signed
 *   `sent` but reads `strings.sent`.
 * @returns `{ key, signature: note.signature, render }` where `render` is
 *   `renderTranscriptNote(document, note.kind, note.text)`, not called here.
 * @remarks Part of `transcriptEntries`; tested through it.
 */
export const noteEntry = (document, key, note) => {
    return {
        key,
        signature: note.signature,
        render: () => renderTranscriptNote(document, note.kind, note.text),
    };
};