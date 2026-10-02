/**
 * The phase transition table `applyPhase` applies.
 *
 * @param readOnly - The event's `readOnly` flag; `false` for events without one.
 * @returns By event kind: `startRequested` from idle or disconnected to starting; `startFailed`
 *   from starting to idle; `started` from any phase to readOnly when `readOnly`, else active;
 *   `restored` from idle or starting to active; `conversationDisconnected` from idle, starting,
 *   active or disconnected (never from readOnly: a republished old disconnect may carry no
 *   `readOnly` flag) to readOnly when `readOnly`, else disconnected; `readOnlyConversation` from
 *   any phase to readOnly. No entry for other kinds.
 * @remarks Pure. Part of `applyPhase`; tested through it.
 */
export const phaseTransitions = (readOnly) => {
    const everyPhase = [
        'idle',
        'starting',
        'active',
        'disconnected',
        'readOnly',
    ];
    return {
        startRequested: { from: ['idle', 'disconnected'], to: 'starting' },
        startFailed: { from: ['starting'], to: 'idle' },
        started: { from: everyPhase, to: readOnly ? 'readOnly' : 'active' },
        restored: { from: ['idle', 'starting'], to: 'active' },
        // Never from readOnly: a re-published old disconnect may carry no readOnly flag.
        conversationDisconnected: {
            from: ['idle', 'starting', 'active', 'disconnected'],
            to: readOnly ? 'readOnly' : 'disconnected',
        },
        readOnlyConversation: { from: everyPhase, to: 'readOnly' },
    };
};