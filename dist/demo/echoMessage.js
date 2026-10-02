import { isRecord, readArray, readRecord, readString } from '#shared';
import { rawMessage } from "./rawMessage.js";
/**
 * The inbound echo Genesys would send back for a frame the demo just "sent".
 *
 * @param frame - From `sendingFrame`.
 * @param id - The echo's message id.
 * @param time - Epoch ms.
 * @returns `rawMessage` (inbound) with the frame's `text` (when a string), the record items of its
 *   `content`, its `tracingId`, and `parentMessageId` from `frame.metadata.parentMessageId`.
 * @remarks Pure. Part of `startDemoBot`; tested through it.
 */
export const echoMessage = (frame, id, time) => {
    const text = readString(frame, 'text');
    const tracingId = readString(frame, 'tracingId');
    const parentMessageId = readString(readRecord(frame, 'metadata') ?? {}, 'parentMessageId');
    return rawMessage({
        id,
        direction: 'Inbound',
        time,
        ...(text === undefined ? {} : { text }),
        content: readArray(frame, 'content').filter(isRecord),
        ...(tracingId === undefined ? {} : { tracingId }),
        ...(parentMessageId === undefined ? {} : { parentMessageId }),
    });
};