import { err, ok } from '#shared';
/** The Guest API's inbound text limit, in UTF-8 bytes (gotchas.md, error 4011). */
export const maxMessageBytes = 4096;
/**
 * Checks what the customer typed before it is sent.
 *
 * @param text - The composer's text, untrimmed.
 * @param hasStagedFile - Whether an uploaded file is waiting to go with this message; then empty
 *   text is allowed (the SDK sends the file alone).
 * @returns The text to send: `text` with leading and trailing whitespace removed (`""` when
 *   sending a file alone).
 * @errors EmptyMessage - when the trimmed text is empty and no file is staged.
 *   MessageTooLong - when the trimmed text is over `maxMessageBytes` UTF-8 bytes, carrying the
 *   byte count and the limit.
 * @remarks Pure. Counts bytes, not characters: "é" is 2 bytes, an emoji 4.
 */
export const validateText = (text, hasStagedFile) => {
    const trimmed = text.trim();
    if (trimmed === '' && !hasStagedFile) {
        return err({ kind: 'EmptyMessage' });
    }
    const bytes = new TextEncoder().encode(trimmed).length;
    if (bytes > maxMessageBytes) {
        return err({ kind: 'MessageTooLong', bytes, maxBytes: maxMessageBytes });
    }
    return ok(trimmed);
};