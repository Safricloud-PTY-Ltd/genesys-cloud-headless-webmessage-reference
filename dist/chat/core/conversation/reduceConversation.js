import { applyConnection } from "./applyConnection.js";
import { applyContinuation } from "./applyContinuation.js";
import { applyHistory } from "./applyHistory.js";
import { applyNotice } from "./applyNotice.js";
import { applyPanel } from "./applyPanel.js";
import { applyPhase } from "./applyPhase.js";
import { applyReset } from "./applyReset.js";
import { applySession } from "./applySession.js";
import { applyTranscript } from "./applyTranscript.js";
import { applyTyping } from "./applyTyping.js";
import { applyUpload } from "./applyUpload.js";
import { applyUploadFailure } from "./applyUploadFailure.js";
// The order is part of the contract: several handlers act on the same event kind.
const handlers = [
    applyReset,
    applyPhase,
    applyTranscript,
    applyContinuation,
    applyHistory,
    applyConnection,
    applyTyping,
    applyUpload,
    applyUploadFailure,
    applyNotice,
    applySession,
    applyPanel,
];
/**
 * Computes the conversation after one event: an SDK event or something the page did.
 *
 * @param state - The conversation before the event.
 * @param event - The event.
 * @returns The state after passing it through every handler in this order: `applyReset`,
 *   `applyPhase`, `applyTranscript`, `applyContinuation`, `applyHistory`, `applyConnection`, `applyTyping`,
 *   `applyUpload`, `applyUploadFailure`, `applyNotice`, `applySession`, `applyPanel`. Each handler acts only on
 *   the kinds it knows, so an event several care about (`fileUploadError`) reaches each of them.
 * @remarks Pure. Every handler's contract holds for the composed result.
 */
export const reduceConversation = (state, event) => {
    return handlers.reduce((s, apply) => apply(s, event), state);
};