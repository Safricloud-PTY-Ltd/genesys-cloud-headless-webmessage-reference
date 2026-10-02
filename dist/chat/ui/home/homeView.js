import { omitUndefined } from '#shared';
/**
 * Decides the home screen's conversation card, as native's home screen does
 * (native-messenger-behaviour.md, "Home screen").
 *
 * @param state - The conversation.
 * @returns `ended` when the phase is `readOnly`; otherwise `continue` when any message has no
 *   `presence`; otherwise `start`. `preview` is the last message without `presence`, for
 *   `continue` and `ended` only, and omitted when there is none.
 * @remarks Pure.
 */
export const homeView = (state) => {
    const preview = state.messages.findLast((message) => message.presence === undefined);
    if (state.phase === 'readOnly') {
        return { card: 'ended', ...omitUndefined({ preview }) };
    }
    if (preview === undefined) {
        return { card: 'start' };
    }
    return { card: 'continue', preview };
};