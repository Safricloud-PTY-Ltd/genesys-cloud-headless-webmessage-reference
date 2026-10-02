/**
 * Shows a header view on the parts `makeHeaderParts` made.
 *
 * @param parts - The header's parts.
 * @param view - What to show.
 * @remarks `bar` has class `home` exactly while `view.view` is `home`. `back` hidden unless
 *   `canGoBack`; `logo` hidden unless `logoUrl`, whose value becomes its `src`; `title` text =
 *   `title`; `subtitle` text = `subtitle`, hidden when absent; `clear` hidden unless `canClear`;
 *   `minimise` has the attribute `data-always` exactly while `minimiseAlways`; `confirm` hidden
 *   when `canClear` is false (otherwise left as it is). Part of `<chat-header>`; tested through it.
 */
export const drawHeader = (parts, view) => {
    parts.bar.classList.toggle('home', view.view === 'home');
    parts.back.hidden = !view.canGoBack;
    parts.logo.hidden = view.logoUrl === undefined;
    if (view.logoUrl === undefined) {
        parts.logo.removeAttribute('src');
    }
    else {
        parts.logo.setAttribute('src', view.logoUrl);
    }
    parts.title.textContent = view.title;
    parts.subtitle.textContent = view.subtitle ?? '';
    parts.subtitle.hidden = view.subtitle === undefined;
    parts.clear.hidden = !view.canClear;
    parts.minimise.toggleAttribute('data-always', view.minimiseAlways);
    if (!view.canClear) {
        parts.confirm.hidden = true;
    }
};