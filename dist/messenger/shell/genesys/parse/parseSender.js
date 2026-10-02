import { isRecord, readString } from '#shared';
/**
 * Reads the sender's display details from a message's `from` (raw `channel.from`, or the
 * formatted `from`, which may be `""` or `{}`).
 *
 * @param value - Untrusted. Reads `nickname` (or the formatted alias `name`) and `image` (or
 *   `avatar`); non-empty strings only.
 * @returns A sender with only the fields found; `{}` for anything else.
 * @remarks Pure. Never fails: a sender is decoration.
 */
export const parseSender = (value) => {
    if (!isRecord(value)) {
        return {};
    }
    // `find(Boolean)` rather than `??`: an empty raw field must fall through to its alias.
    const nickname = [readString(value, 'nickname'), readString(value, 'name')].find(Boolean);
    const image = [readString(value, 'image'), readString(value, 'avatar')].find(Boolean);
    return {
        ...(nickname ? { nickname } : {}),
        ...(image ? { image } : {}),
    };
};