/**
 * Whether the launcher button is on screen, by the deployment's launcher visibility.
 *
 * @param state - The conversation.
 * @returns `false` until `lookAndFeel` is known. Then by `lookAndFeel.launcher.visibility`: `On` →
 *   `true`; `Off` → `false` (the page opens the panel itself); `OnDemand` → `true` once
 *   `panel.launcherRevealed` or while the phase is anything but `idle` (native shows it when the
 *   panel is opened or a conversation restored, and keeps it until the conversation is cleared or
 *   the session ends), else `false`.
 * @remarks Pure.
 */
export const launcherShown = (state) => {
    const visibility = state.lookAndFeel?.launcher.visibility;
    if (visibility === 'OnDemand') {
        return state.panel.launcherRevealed || state.phase !== 'idle';
    }
    return visibility === 'On';
};