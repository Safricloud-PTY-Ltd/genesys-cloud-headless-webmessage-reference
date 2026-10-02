import { renderExternalLink } from "../renderExternalLink.js";
/**
 * Builds DOM for rich-text nodes. Text is only ever inserted as text nodes: message content never
 * becomes HTML, so a message can never inject markup or script (docs/guides/rich-text.md).
 *
 * @param nodes - From `parseRichText`. May be empty.
 * @param document - The document to create nodes with.
 * @returns A fragment holding, in order: a text node per `text`; `<strong>`, `<em>`, `<s>`,
 *   `<mark>` with their children; `<code>` for `code` and `<pre><code>` for `codeBlock`, each
 *   holding one text node; and, for `link`, `renderExternalLink(document, href, children)` (the
 *   chat's one way to make an outside link, with its hidden "opens in a new tab" hint),
 *   with `title` when given.
 * @remarks Never sets `innerHTML`, or any attribute other than `href`, `target`, `rel` and `title`
 *   (and the `class` of the link's hidden hint).
 */
export const renderRichText = (nodes, document) => {
    const fragment = document.createDocumentFragment();
    fragment.append(...nodes.map((node) => {
        if (node.kind === 'text')
            return document.createTextNode(node.text);
        if ('text' in node) {
            const code = document.createElement('code');
            code.append(document.createTextNode(node.text));
            if (node.kind === 'code')
                return code;
            const pre = document.createElement('pre');
            pre.append(code);
            return pre;
        }
        if (node.kind === 'link') {
            const anchor = renderExternalLink(document, node.href, [
                renderRichText(node.children, document),
            ]);
            if (node.title !== undefined)
                anchor.setAttribute('title', node.title);
            return anchor;
        }
        const wrapper = document.createElement(node.kind);
        wrapper.append(renderRichText(node.children, document));
        return wrapper;
    }));
    return fragment;
};