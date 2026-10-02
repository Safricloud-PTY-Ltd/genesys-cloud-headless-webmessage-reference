import { ChatComposer } from "./composer/index.js";
import { ChatForm } from "./form/index.js";
import { ChatHeader } from "./header/index.js";
import { ChatHome } from "./home/index.js";
import { ChatLauncher } from "./launcher/index.js";
import { ChatConversation, ChatWindow } from "./window/index.js";
// chat-window last: upgrading a chat-window creates its children, which must already be defined.
const chatElements = [
    ['chat-composer', ChatComposer],
    ['chat-form', ChatForm],
    ['chat-launcher', ChatLauncher],
    ['chat-header', ChatHeader],
    ['chat-home', ChatHome],
    ['chat-conversation', ChatConversation],
    ['chat-window', ChatWindow],
];
/**
 * Registers the chat's custom elements: `<chat-window>`, `<chat-launcher>`, `<chat-header>`,
 * `<chat-home>`, `<chat-conversation>`, `<chat-composer>` and `<chat-form>`.
 * Components never register themselves on import; the page decides when.
 *
 * @param registry - Usually `window.customElements`.
 * @remarks Idempotent: a name already defined is skipped, so calling twice is safe. Defines
 *   every other element before `<chat-window>`: defining an element upgrades any
 *   already in the page at once, and a `<chat-window>` creates its children while upgrading.
 */
export const defineChatElements = (registry) => {
    chatElements.forEach(([name, element]) => {
        if (registry.get(name) === undefined) {
            registry.define(name, element);
        }
    });
};