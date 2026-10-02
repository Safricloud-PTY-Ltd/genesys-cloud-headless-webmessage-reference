import { strings } from "../strings.js";
/**
 * Names who sent a message, the way native Messenger names them.
 *
 * @param message - The message.
 * @param context - For the deployment's bot name (`context.humanize.botName`).
 * @returns `strings.you` for `Inbound`. For `Outbound`: `sender.nickname` when set; else, for a
 *   `Bot` (`originatingEntity`), `context.humanize.botName` when set, else `strings.bot`; else
 *   `strings.agent`.
 * @remarks Pure. Part of `renderMessage`; tested through it.
 */
export const senderName = (message, context) => {
    if (message.direction === 'Inbound') {
        return strings.you;
    }
    return (message.sender.nickname ??
        (message.originatingEntity === 'Bot'
            ? (context.humanize.botName ?? strings.bot)
            : strings.agent));
};