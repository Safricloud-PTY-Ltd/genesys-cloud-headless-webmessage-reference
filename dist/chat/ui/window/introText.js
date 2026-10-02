import { strings } from "../strings.js";
/**
 * The system line native Messenger shows at the very top of a conversation.
 *
 * @param state - The conversation.
 * @returns `undefined` while older history may still exist (`history` is not `complete` and
 *   there is at least one message). Otherwise `strings.introAutoStart` when `settings.autoStart`
 *   is `true`, else `strings.intro` (which adds "Please send a message to get started.").
 * @remarks Pure.
 */
export const introText = (state) => {
    if (state.history !== 'complete' && state.messages.length > 0)
        return undefined;
    return state.settings?.autoStart === true ? strings.introAutoStart : strings.intro;
};