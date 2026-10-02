/**
 * Lets the page's own buttons open the chat, as a brand page calls `Messenger.open` when the
 * deployment hides native's launcher (Admin: "Use Always hide if you build your own custom
 * Messenger"; native-messenger-behaviour.md, "Visibility modes").
 *
 * @param host - The page's document.
 * @param chat - The `<chat-window>`, or anything with its `open`.
 * @remarks Every element matching `[data-chat-open]` in `host.document` when this runs gets a click
 *   listener that calls `chat.open()` (which does nothing while the panel is already open).
 *   Elements added later are not wired.
 */
export const wireOpenButtons = (host, chat) => {
    host.document.querySelectorAll('[data-chat-open]').forEach((element) => {
        element.addEventListener('click', () => {
            chat.open();
        });
    });
};