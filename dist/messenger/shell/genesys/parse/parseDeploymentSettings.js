import { err, isRecord, ok, readBoolean, readRecord, readString } from '#shared';
import { invalidPayload } from "../../../types.js";
/**
 * Reads the flags a headless UI must honour from the `GenesysJS.configuration` result (the
 * trimmed public deployment configuration; docs/guides/sdk-source-notes.md).
 *
 * @param value - Untrusted. Reads `messenger.apps.conversations.{autoStart.enabled,
 *   showAgentTypingIndicator, showUserTypingIndicator, conversationClear.enabled,
 *   conversationDisconnect.{enabled, type}}` and `messenger.fileUpload.enableAttachments`.
 * @returns The settings. A missing or non-boolean flag is `false`. `disconnect` is `Off` unless
 *   `conversationDisconnect.enabled` is `true`, then its `type` (`Send` or `ReadOnly`; anything
 *   else reads as `Send`).
 * @errors InvalidPayload (source `GenesysJS.configuration`) - when `value` is not a record or has
 *   no `messenger` record.
 * @remarks Pure.
 */
export const parseDeploymentSettings = (value) => {
    const messenger = isRecord(value) ? readRecord(value, 'messenger') : undefined;
    if (messenger === undefined) {
        return err(invalidPayload('GenesysJS.configuration', 'messenger is not a record'));
    }
    // Spreading a missing record gives `{}`, so every absent level reads its flags as false.
    const conversations = { ...readRecord({ ...readRecord(messenger, 'apps') }, 'conversations') };
    const fileUpload = { ...readRecord(messenger, 'fileUpload') };
    const autoStart = { ...readRecord(conversations, 'autoStart') };
    const conversationClear = { ...readRecord(conversations, 'conversationClear') };
    const conversationDisconnect = { ...readRecord(conversations, 'conversationDisconnect') };
    const disconnectType = readString(conversationDisconnect, 'type') === 'ReadOnly' ? 'ReadOnly' : 'Send';
    return ok({
        autoStart: readBoolean(autoStart, 'enabled') === true,
        attachmentsEnabled: readBoolean(fileUpload, 'enableAttachments') === true,
        showAgentTypingIndicator: readBoolean(conversations, 'showAgentTypingIndicator') === true,
        showUserTypingIndicator: readBoolean(conversations, 'showUserTypingIndicator') === true,
        conversationClearEnabled: readBoolean(conversationClear, 'enabled') === true,
        disconnect: readBoolean(conversationDisconnect, 'enabled') === true ? disconnectType : 'Off',
    });
};