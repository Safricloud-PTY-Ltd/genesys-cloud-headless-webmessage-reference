import { composerMode } from "../../core/index.js";
/**
 * What the composer should show for a conversation.
 *
 * @param state - The conversation.
 * @returns `mode` from `composerMode`; `upload` as is; `canAttach` and `sendTyping` from
 *   `settings.attachmentsEnabled` and `settings.showUserTypingIndicator` (`false` before settings
 *   load); `filePolicy` when known.
 * @remarks Pure.
 */
export const composerView = (state) => {
    return {
        mode: composerMode(state),
        upload: state.upload,
        canAttach: state.settings?.attachmentsEnabled ?? false,
        sendTyping: state.settings?.showUserTypingIndicator ?? false,
        ...(state.filePolicy ? { filePolicy: state.filePolicy } : {}),
    };
};