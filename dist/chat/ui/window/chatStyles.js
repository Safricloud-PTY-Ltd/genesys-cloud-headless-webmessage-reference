import { composerStyles } from "./composerStyles.js";
import { launcherStyles } from "./launcherStyles.js";
import { panelStyles } from "./panelStyles.js";
import { structuredStyles } from "./structuredStyles.js";
import { transcriptStyles } from "./transcriptStyles.js";
/**
 * The messenger's stylesheet, adopted by `<chat-window>`'s shadow root and so reaching every
 * element and row inside it. It reproduces native Genesys Messenger's look from measurements
 * (docs/guides/native-messenger-ui.md), never from Genesys' own CSS, which is proprietary. Theme
 * values come from custom properties `<chat-window>` sets inline on itself from the deployment:
 * `--chat-primary`, `--chat-on-primary`, `--chat-side-space`, `--chat-bottom-space`. A page
 * overrides them on `chat-window` only with `!important`. Plain CSS, in five parts joined in this
 * order.
 */
export const chatStyles = [
    panelStyles,
    launcherStyles,
    transcriptStyles,
    structuredStyles,
    composerStyles,
].join('\n');