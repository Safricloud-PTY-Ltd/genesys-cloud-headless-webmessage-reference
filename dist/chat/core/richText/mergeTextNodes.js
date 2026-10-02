/**
 * Joins neighbouring text runs so a parse never yields two text nodes side by side.
 *
 * @param nodes - Nodes in reading order. May be empty.
 * @returns The same nodes with each run of adjacent `text` nodes joined into one, and empty
 *   `text` nodes dropped. Only the top level is touched; children are left as they are.
 * @remarks Pure. Part of `parseRichText`; tested through it.
 */
export const mergeTextNodes = (nodes) => nodes.reduce((merged, node) => {
    if (node.kind !== 'text')
        return [...merged, node];
    if (node.text === '')
        return merged;
    const last = merged.at(-1);
    return last?.kind === 'text'
        ? merged.with(-1, { kind: 'text', text: last.text + node.text })
        : [...merged, node];
}, []);