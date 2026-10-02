import { strings } from "../strings.js";
/** The line shown for each presence event but `Disconnect`, which gets the ended block. */
const presenceText = {
    Join: strings.presenceJoin,
    Clear: strings.presenceClear,
    SignIn: strings.presenceSignIn,
    SessionExpired: strings.presenceSessionExpired,
};
/**
 * Shows a presence event (someone joined, the conversation ended or was cleared, ...) in the
 * transcript, as native Messenger's centred system lines.
 *
 * @param message - A message whose `presence` is set.
 * @param context - The document, `formatDateTime` and `disconnect`.
 * @returns For `Disconnect`, native's ended block, inline after the disconnect: an
 *   `<li class="presence ended">` holding a `<p>` of `strings.conversationEnded`, a `<time>` with
 *   `datetime` = the ISO time and text `context.formatDateTime(time)`, and, when
 *   `context.disconnect` is `Send`, a `<p>` of `strings.resumeHint`. For the others, an
 *   `<li class="presence">` whose text is `strings.presenceJoin`, `strings.presenceClear`,
 *   `strings.presenceSignIn` or `strings.presenceSessionExpired`, except that an `Inbound` Join
 *   (the customer's own, sent with autoStart) reads `strings.presenceJoinSelf`. An empty
 *   `<li class="presence">` when `presence` is unset.
 * @remarks Sets no `innerHTML`. Part of `renderMessage`; tested through it.
 */
export const renderPresence = (message, context) => {
    const { document } = context;
    const item = document.createElement('li');
    item.className = 'presence';
    if (message.presence === undefined) {
        return item;
    }
    if (message.presence !== 'Disconnect') {
        item.textContent =
            message.presence === 'Join' && message.direction === 'Inbound'
                ? strings.presenceJoinSelf
                : presenceText[message.presence];
        return item;
    }
    item.classList.add('ended');
    const ended = document.createElement('p');
    ended.textContent = strings.conversationEnded;
    const stamp = document.createElement('time');
    stamp.setAttribute('datetime', new Date(message.time).toISOString());
    stamp.textContent = context.formatDateTime(message.time);
    item.append(ended, stamp);
    if (context.disconnect === 'Send') {
        const hint = document.createElement('p');
        hint.textContent = strings.resumeHint;
        item.append(hint);
    }
    return item;
};