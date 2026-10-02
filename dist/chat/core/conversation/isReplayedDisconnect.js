/**
 * Tells whether a `conversationDisconnected` is an old Disconnect replayed from history rather
 * than one happening now.
 *
 * @param state - The conversation before the event.
 * @param time - The Disconnect's time in epoch ms; `undefined` when the payload didn't say.
 * @returns `true` when `time` is defined and some message in the transcript is later than it:
 *   the conversation carried on after that Disconnect, so it is not the current state. `false`
 *   otherwise, including when `time` is `undefined` (treated as current, as before).
 * @remarks Pure. The SDK republishes `conversationDisconnected` when it formats an old Disconnect in
 *   fetched or restored history (sdk-source-notes.md, "What is filtered, and what is not").
 */
export const isReplayedDisconnect = (state, time) => time !== undefined && state.messages.some((m) => m.time > time);