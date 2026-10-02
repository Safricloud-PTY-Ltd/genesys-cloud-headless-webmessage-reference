import { defineChatElements } from '#chat';
import { makeMessenger } from '#messenger';
import { connectChat } from "./connectChat.js";
import { makeOpenMemory } from "./makeOpenMemory.js";
import { createGenesys } from "./createGenesys.js";
import { readConfig } from "./readConfig.js";
import { renderConfigHelp } from "./ui/index.js";
import { wireOpenButtons } from "./wireOpenButtons.js";
/**
 * Starts the page: reads the configuration, loads Messenger (or the demo), and mounts the chat.
 *
 * @param host - The window and document.
 * @remarks `readConfig(location.search)`: on failure, appends `renderConfigHelp` to the body and
 *   stops. On success: `defineChatElements(window.customElements)`; `createGenesys`; `makeMessenger`
 *   with the window's timers, a 15 s timeout and `console.warn`; a `<chat-window>` (with the
 *   attribute `markdown="off"` when the config turns markdown off), appended to the body (it
 *   positions itself, as native's launcher does); then `connectChat` with
 *   `makeOpenMemory(() => window.localStorage, key)`, where `key` is
 *   `webmessage-reference:<deploymentId>:open`, or `webmessage-reference:demo:open` for the demo;
 *   then `wireOpenButtons(host, chat)`, so the page's `[data-chat-open]` buttons open it. The messenger is created before the window is appended, so no SDK event is
 *   missed.
 */
export const bootstrap = (host) => {
    const config = readConfig(host.window.location.search);
    if (!config.ok) {
        host.document.body.append(renderConfigHelp(config.error, host.document));
        return;
    }
    defineChatElements(host.window.customElements);
    const deps = {
        genesys: createGenesys(config.value, host),
        setTimeout: (callback, ms) => host.window.setTimeout(callback, ms),
        clearTimeout: (handle) => {
            host.window.clearTimeout(handle);
        },
        timeoutMs: 15_000,
        warn: (message, detail) => {
            console.warn(message, detail);
        },
    };
    const messenger = makeMessenger(deps);
    // Safe: defineChatElements registered `chat-window` as ChatWindow just above.
    const chat = host.document.createElement('chat-window');
    if (!config.value.markdown)
        chat.setAttribute('markdown', 'off');
    host.document.body.append(chat);
    const owner = config.value.kind === 'live' ? config.value.deploymentId : 'demo';
    const openMemory = makeOpenMemory(() => host.window.localStorage, `webmessage-reference:${owner}:open`);
    connectChat({ messenger, chat, warn: deps.warn, openMemory });
    wireOpenButtons(host, chat);
};