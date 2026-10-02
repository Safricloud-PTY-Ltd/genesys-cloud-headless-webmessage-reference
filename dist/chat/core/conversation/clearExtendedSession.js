/**
 * Takes down the session-expiry warning once the session has really been extended.
 *
 * @param state - The conversation.
 * @param expiresAt - The session's new expiry, in epoch ms.
 * @returns `state` without `sessionExpiresAt` when `expiresAt` is later than it; `state` itself when
 *   no warning is stored or the expiry did not move later (the SDK republishes timing on every
 *   restore and reconnect).
 * @remarks Pure. Part of `applySession`; tested through it.
 */
export const clearExtendedSession = (state, expiresAt) => {
    // exactOptionalPropertyTypes: the field must be absent, not set to undefined.
    // With no warning stored, Infinity makes nothing "later", so the state is kept.
    const { sessionExpiresAt: stored = Infinity, ...rest } = state;
    return expiresAt > stored ? rest : state;
};