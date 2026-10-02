import { matchInline } from "./matchInline.js";
import { mergeTextNodes } from "./mergeTextNodes.js";
import { unlinkNodes } from "./unlinkNodes.js";
/**
 * The nodes one match contributes to the parse.
 *
 * @param match - From `matchInline`.
 * @param options - Passed on when parsing the match's inner text.
 * @returns `leaf` → `[node]`; `wrap` → `[{ kind: wrap, children: parseRichText(inner) }]`; `link`
 *   with `href` → `[{ kind: 'link', href, title?, children: unlinkNodes(parseRichText(inner)) }]`;
 *   `link` without `href` → `parseRichText(inner)`.
 */
const toRichNodes = (match, options) => {
    if (match.kind === 'leaf')
        return [match.node];
    if (match.kind === 'wrap') {
        return [{ kind: match.wrap, children: parseRichText(match.inner, options) }];
    }
    if (match.href === undefined)
        return parseRichText(match.inner, options);
    return [
        {
            kind: 'link',
            href: match.href,
            ...(match.title === undefined ? {} : { title: match.title }),
            children: unlinkNodes(parseRichText(match.inner, options)),
        },
    ];
};
/**
 * Turns message text into rich-text nodes with the subset Genesys Messenger renders: `*bold*`,
 * `_italic_`, `~strike~`, `==highlight==` (outbound), `` `code` ``, ``` ```blocks``` ```,
 * `[links](https://…)`, bare URLs and emails, and backslash escapes (docs/guides/rich-text.md).
 * Everything else, HTML included, stays literal text.
 *
 * @param text - The message text, untrusted. May be empty.
 * @param options - Whether markdown is on, and the message's direction.
 * @returns Nodes in reading order. Text between matches becomes `text` nodes, adjacent ones
 *   merged; newlines are kept inside text (the UI shows them with `white-space: pre-wrap`). A
 *   `wrap` match becomes its node with `inner` parsed again; a `link` match with an `href`
 *   becomes a `link` node with `inner` parsed again but with any link inside it replaced by its
 *   children (no links in links); one without an `href` contributes its parsed children directly.
 *   Empty text gives no nodes.
 * @remarks Pure. Concatenating every text, code and codeBlock in the result, in order, gives
 *   `text` with the markup characters removed. Uses `matchInline` at each position.
 */
export const parseRichText = (text, options) => {
    // A reduce over code-unit positions, not recursion, so a 4096-char message costs no stack.
    const scanned = text.split('').reduce((state, unit, at) => {
        if (at < state.skipUntil)
            return state;
        const match = matchInline(text, at, options);
        return match === undefined
            ? { ...state, buffer: state.buffer + unit }
            : {
                nodes: [
                    ...state.nodes,
                    { kind: 'text', text: state.buffer },
                    ...toRichNodes(match, options),
                ],
                buffer: '',
                skipUntil: match.end,
            };
    }, { nodes: [], buffer: '', skipUntil: 0 });
    return mergeTextNodes([...scanned.nodes, { kind: 'text', text: scanned.buffer }]);
};