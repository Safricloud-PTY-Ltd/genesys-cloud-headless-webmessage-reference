import { toSafeUrl } from "../../core/index.js";
import { senderName } from "./senderName.js";
/**
 * Draws the avatar native Messenger shows beside an agent's or bot's bubble when the deployment
 * turns humanize on.
 *
 * @param message - The message.
 * @param context - The document and `context.humanize`.
 * @returns `undefined` for an `Inbound` message or when `context.humanize.enabled` is `false`.
 *   Otherwise a `<span class="avatar" aria-hidden="true">` holding an `<img alt="">` of the
 *   picture, which is `sender.image`, or for a `Bot` without one `context.humanize.botAvatarUrl`,
 *   kept only when `toSafeUrl(url, ['https:'])` accepts it; with no usable picture, the first
 *   character of `senderName(message, context)`, upper-cased, as text.
 * @remarks Sets no `innerHTML`. Part of `renderMessage`; tested through it.
 */
export const renderAvatar = (message, context) => {
    if (message.direction === 'Inbound' || !context.humanize.enabled) {
        return undefined;
    }
    const { document } = context;
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    const botPicture = message.originatingEntity === 'Bot' ? context.humanize.botAvatarUrl : undefined;
    const picture = [message.sender.image, botPicture]
        .map((url) => (url === undefined ? undefined : toSafeUrl(url, ['https:'])))
        .find((url) => url !== undefined);
    if (picture === undefined) {
        avatar.textContent = senderName(message, context).charAt(0).toUpperCase();
        return avatar;
    }
    const image = document.createElement('img');
    image.setAttribute('alt', '');
    image.setAttribute('src', picture);
    avatar.append(image);
    return avatar;
};