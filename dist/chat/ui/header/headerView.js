import { omitUndefined } from '#shared';
import { launcherShown, pickLabels } from "../../core/index.js";
import { strings } from "../strings.js";
import { isClearable } from "./isClearable.js";
/**
 * Decides what the header shows, as native Messenger's header does.
 *
 * @param state - The conversation.
 * @param language - The page's language tag, for the admin's custom home-screen labels. May be
 *   empty.
 * @returns `view` from `panel.view`. For `home`: `title` = `pickLabels(labels,
 *   language)?.homeTitle` else `strings.homeTitle`, `subtitle` likewise from `homeSubtitle` else
 *   `strings.homeSubtitle`, and `logoUrl` = `lookAndFeel.homeScreen.logoUrl` when set. For
 *   `conversation`: `title` = `strings.headerTitle`, no subtitle, no logo. `canGoBack` when the view is
 *   `conversation` and the home screen is enabled. `canClear` when the panel is open, the view is
 *   `conversation`, `settings.conversationClearEnabled` is `true` and there is at least one
 *   message.
 *   `minimiseAlways` = `!launcherShown(state)`.
 * @remarks Pure.
 */
export const headerView = (state, language) => {
    // Before the look and feel loads there are no custom labels and no home screen to go back to.
    const look = state.lookAndFeel ?? {
        labels: [],
        homeScreen: { enabled: false },
    };
    const chosen = pickLabels(look.labels, language) ?? {};
    const inConversation = state.panel.view === 'conversation';
    const heading = inConversation
        ? { title: strings.headerTitle }
        : {
            title: strings.homeTitle,
            subtitle: strings.homeSubtitle,
            ...omitUndefined({
                title: chosen.homeTitle,
                subtitle: chosen.homeSubtitle,
                logoUrl: look.homeScreen.logoUrl,
            }),
        };
    return {
        view: state.panel.view,
        ...heading,
        canGoBack: inConversation && look.homeScreen.enabled,
        canClear: isClearable(state),
        minimiseAlways: !launcherShown(state),
    };
};