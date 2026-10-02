import { mergeTextNodes } from "./mergeTextNodes.js";
/**
 * Removes links from rich text, keeping what they show: a link's text cannot hold another link.
 *
 * @param nodes - Nodes in reading order.
 * @returns The nodes with every `link`, at any depth, replaced by its (unlinked) children, and
 *   `mergeTextNodes` applied at each level rebuilt, so no level has adjacent text nodes.
 * @remarks Pure. Part of `parseRichText`; tested through it.
 */
export const unlinkNodes = (nodes) => mergeTextNodes(nodes.flatMap((node) => {
    if (node.kind === 'link')
        return unlinkNodes(node.children);
    if ('children' in node)
        return [{ ...node, children: unlinkNodes(node.children) }];
    return [node];
}));