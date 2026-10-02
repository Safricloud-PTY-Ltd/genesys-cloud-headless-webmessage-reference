/**
 * Tells whether the customer can answer a quick reply, card, picker or form right now.
 *
 * @param state - The conversation.
 * @returns `true` when the phase is `active` and no upload is `uploading` or `staged`.
 * @remarks Pure. A staged upload blocks answers because the SDK marks it sent with the next
 *   `sendMessage` of any kind, yet a typed reply's frame carries no attachment
 *   (sdk-source-notes.md, "What each `sendMessage` call puts on the wire"). The customer sends or
 *   removes the file first.
 */
export const canAnswer = (state) => state.phase === 'active' && state.upload.kind === 'none';