/**
 * Makes a list's children match the transcript entries, touching as little of the DOM as possible.
 * Reusing rows keeps a screen reader's live region from re-announcing the whole conversation and
 * keeps an open form or a focused button alive.
 *
 * @param list - The `<ol>` holding the rows. Its children are only ever rows made here.
 * @param entries - The rows wanted, in order. Keys are unique.
 * @remarks Afterwards the list has exactly one child per entry, in order, each with
 *   `data-key` = key and `data-signature` = signature. A child whose key and signature already
 *   match is kept (moved if needed, never re-rendered); a key with a new signature is re-rendered
 *   in place; new keys are rendered and inserted; children with keys no longer present are removed.
 *   `render` is called only for new or changed rows.
 */
export const syncTranscript = (list, entries) => {
    const existing = new Map(Array.from(list.children).map((child) => [child.getAttribute('data-key'), child]));
    const wanted = new Set(entries.map((entry) => entry.key));
    entries.forEach((entry, i) => {
        const old = existing.get(entry.key);
        const row = old?.getAttribute('data-signature') === entry.signature ? old : entry.render();
        if (row !== old) {
            row.setAttribute('data-key', entry.key);
            row.setAttribute('data-signature', entry.signature);
            old?.replaceWith(row);
        }
        const current = list.children.item(i);
        if (current !== row)
            list.insertBefore(row, current);
    });
    Array.from(list.children)
        .filter((child) => !wanted.has(child.getAttribute('data-key') ?? ''))
        .forEach((child) => {
        child.remove();
    });
};