/**
 * Shows one line in the transcript that isn't a message: the conversation's opening line, a date
 * separator, or the "Sent" mark under the customer's last message.
 *
 * @param document - The document to create it with.
 * @param kind - Which line: `intro`, `day` or `sent`.
 * @param text - What it says.
 * @returns An `<li class="note <kind>">` whose text is `text`.
 * @remarks Sets no `innerHTML`. Part of `transcriptEntries`; tested through it.
 */
export const renderTranscriptNote = (document, kind, text) => {
    const note = document.createElement('li');
    note.className = `note ${kind}`;
    note.textContent = text;
    return note;
};