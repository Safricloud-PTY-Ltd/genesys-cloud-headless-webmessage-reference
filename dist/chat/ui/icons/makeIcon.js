const svgNamespace = 'http://www.w3.org/2000/svg';
const icons = {
    // @mui/icons-material 9.4.0 Chat, MIT
    chat: {
        viewBox: '0 0 24 24',
        d: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2M6 9h12v2H6zm8 5H6v-2h8zm4-6H6V6h12z',
    },
    // @mui/icons-material 9.4.0 ExpandMore, MIT
    expandMore: { viewBox: '0 0 24 24', d: 'M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z' },
    // @mui/icons-material 9.4.0 Send, MIT
    send: { viewBox: '0 0 24 24', d: 'M2.01 21 23 12 2.01 3 2 10l15 2-15 2z' },
    // @mui/icons-material 9.4.0 AttachFile, MIT
    attachFile: {
        viewBox: '0 0 24 24',
        d: 'M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6z',
    },
    // @mui/icons-material 9.4.0 Remove, MIT
    remove: { viewBox: '0 0 24 24', d: 'M19 13H5v-2h14z' },
    // @mui/icons-material 9.4.0 ChevronLeft, MIT
    chevronLeft: { viewBox: '0 0 24 24', d: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z' },
    // @mui/icons-material 9.4.0 Close, MIT
    close: {
        viewBox: '0 0 24 24',
        d: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    },
    // Material Symbols Outlined delete 48px, Apache-2.0, google/material-design-icons
    delete: {
        viewBox: '0 -960 960 960',
        d: 'M261-120q-24.75 0-42.37-17.63Q201-155.25 201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438v-570ZM367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z',
    },
};
/**
 * Draws one of native Messenger's icons as inline SVG, so the buttons look the same without
 * loading anything (docs/guides/native-messenger-ui.md, "Icons: exact path data").
 *
 * @param document - The document to create it with.
 * @param name - Which icon. `chat`, `expandMore`, `send`, `attachFile`, `remove`, `chevronLeft`
 *   and `close` are `@mui/icons-material` 9.4.0's `Chat`, `ExpandMore`, `Send`, `AttachFile`,
 *   `Remove`, `ChevronLeft` and `Close` (MIT); `delete` is Google Material Symbols Outlined
 *   `delete`, 48 px, weight 400 (Apache-2.0).
 * @returns An `<svg>` in the SVG namespace with `class="icon"`, `aria-hidden="true"`,
 *   `focusable="false"` and `viewBox` `0 0 24 24` (`0 -960 960 960` for `delete`), holding one
 *   `<path>` with that icon's `d` from the guide and `fill="currentColor"`, so it takes the text
 *   colour of the button around it.
 * @remarks Sets no `innerHTML`: every node is made with `createElementNS`. The path strings live
 *   in this file, each with a one-line comment naming its source and licence
 *   (THIRD-PARTY-NOTICES.md carries the licence texts).
 */
export const makeIcon = (document, name) => {
    const { viewBox, d } = icons[name];
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('viewBox', viewBox);
    const path = document.createElementNS(svgNamespace, 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', d);
    svg.append(path);
    return svg;
};