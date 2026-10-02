import { isRecord, readString } from '#shared';
/**
 * Reads a presence event's type.
 *
 * @param value - Untrusted: `{ type }`.
 * @returns The type when it is one of `Join`, `Disconnect`, `Clear`, `SignIn`, `SessionExpired`;
 *   otherwise `undefined`.
 * @remarks Pure. Part of the message parsers; tested through them.
 */
export const parsePresenceType = (value) => {
    const known = [
        'Join',
        'Disconnect',
        'Clear',
        'SignIn',
        'SessionExpired',
    ];
    const type = isRecord(value) ? readString(value, 'type') : undefined;
    return known.find((presence) => presence === type);
};