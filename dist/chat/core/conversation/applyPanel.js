/**
 * Opens, minimises and navigates the messenger panel, as native Messenger does
 * (docs/guides/native-messenger-behaviour.md).
 *
 * @param state - The conversation before the event.
 * @param event - Any conversation event; this handler acts on some kinds and passes the rest.
 * @returns With `home` meaning `lookAndFeel.homeScreen.enabled` (false before the look and feel
 *   loads):
 *   - `panelOpened` → `open: true`, `autoStartSpent: false`, `launcherRevealed: true`, and `view`
 *     `home` when `home`, else `conversation` (native opens to its home screen when there is one);
 *   - `panelRestored` → while the panel is closed: `open: true`, `view: 'conversation'`,
 *     `autoStartSpent: false`, `launcherRevealed: true` (native reopens straight onto the
 *     restored conversation); while it is open, no change (`restored` repeats after every
 *     reconnect, and must not move the customer);
 *   - `panelMinimised` → `open: false`, `view` kept;
 *   - `homeLeft` → `view: 'conversation'`; `homeReturned` → `view: 'home'` when `home`, else no
 *     change;
 *   - `startRequested` → `autoStartSpent: true`;
 *   - `conversationCleared` and `sessionCleared` → `open: false`, `launcherRevealed: false`, and
 *     `view` `home` when `home`, else `conversation` (native closes the window after a confirmed
 *     Clear, and an `OnDemand` launcher hides again).
 *   Every other field is kept.
 * @remarks Pure. Returns `state` itself (same reference) for every other event kind.
 */
export const applyPanel = (state, event) => {
    const home = state.lookAndFeel?.homeScreen.enabled === true;
    const landing = home ? 'home' : 'conversation';
    const changes = {
        panelOpened: { open: true, view: landing, autoStartSpent: false, launcherRevealed: true },
        panelRestored: state.panel.open
            ? {}
            : { open: true, view: 'conversation', autoStartSpent: false, launcherRevealed: true },
        panelMinimised: { open: false },
        homeLeft: { view: 'conversation' },
        homeReturned: home ? { view: 'home' } : {},
        startRequested: { autoStartSpent: true },
        conversationCleared: { open: false, view: landing, launcherRevealed: false },
        sessionCleared: { open: false, view: landing, launcherRevealed: false },
    };
    const change = changes[event.kind];
    return change === undefined ? state : { ...state, panel: { ...state.panel, ...change } };
};