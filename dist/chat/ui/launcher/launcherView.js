import { omitUndefined } from '#shared';
import { launcherShown, pickLabels } from "../../core/index.js";
import { strings } from "../strings.js";
/**
 * Decides what the launcher shows.
 *
 * @param state - The conversation.
 * @param language - The page's language tag, for the admin's custom launcher text. May be empty.
 * @returns `shown` from `launcherShown(state)`; `open` from `panel.open`; `display` and `iconUrl`
 *   from `lookAndFeel.launcher` (`Icon` and none before it loads); `text` is
 *   `pickLabels(lookAndFeel.labels, language)?.launcherText`, else `strings.launcherText`, cut to
 *   its first 20 characters, as native does.
 * @remarks Pure.
 */
export const launcherView = (state, language) => {
    const launcher = state.lookAndFeel?.launcher ?? {
        display: 'Icon',
    };
    const text = pickLabels(state.lookAndFeel?.labels ?? [], language)?.launcherText ?? strings.launcherText;
    return {
        shown: launcherShown(state),
        open: state.panel.open,
        display: launcher.display,
        text: text.slice(0, 20),
        ...omitUndefined({ iconUrl: launcher.iconUrl }),
    };
};