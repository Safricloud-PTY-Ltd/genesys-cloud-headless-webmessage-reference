import { err, ok } from '#shared';
/**
 * Checks a file against the deployment's rules before asking the SDK to upload it. The SDK checks
 * nothing client-side and the server refuses with a less useful error (sdk-source-notes.md).
 *
 * @param file - The file's name, size in bytes and MIME type (`""` when the browser can't tell).
 * @param policy - From `allowedFileTypes`; `undefined` before it arrives, in which case only the
 *   rules that need no policy apply (empty file, missing extension, 10 240 KB).
 * @returns The same file facts.
 * @errors Checked in this order, first failure wins:
 *   FileEmpty - when `size` is 0.
 *   FileExtensionMissing - when `name` has no `.` followed by at least one character after
 *   its last path segment.
 *   FileExtensionBlocked - when the lower-cased extension (with its dot) is in
 *   `policy.blockedExtensions`, carrying it.
 *   FileTooLarge - when `size` is over `policy.maxFileSizeKB` × 1024 bytes (10 240 KB without a
 *   policy), carrying the size in KB rounded up and the limit.
 *   FileTypeNotAllowed - when `policy.fileTypes` has no entry matching the lower-cased `type`:
 *   an exact match, `*\/*`, or `major/*` matching the type's major part. An empty `type` matches
 *   only `*\/*`.
 * @remarks Pure.
 */
export const validateFile = (file, policy) => {
    const base = file.name.slice(file.name.lastIndexOf('/') + 1);
    // Without a dot this leaves the last character, which fails the leading-dot check below.
    const extension = base.slice(base.lastIndexOf('.')).toLowerCase();
    // Before `allowedFileTypes` arrives only the 10 240 KB default applies, so allow every type.
    const rules = policy ?? {
        fileTypes: ['*/*'],
        maxFileSizeKB: 10_240,
        blockedExtensions: [],
    };
    const mime = file.type.toLowerCase();
    const majorWildcard = `${mime.slice(0, mime.indexOf('/'))}/*`;
    if (file.size === 0)
        return err({ kind: 'FileEmpty' });
    if (!extension.startsWith('.') || extension.length < 2) {
        return err({ kind: 'FileExtensionMissing' });
    }
    if (rules.blockedExtensions.includes(extension)) {
        return err({ kind: 'FileExtensionBlocked', extension });
    }
    if (file.size > rules.maxFileSizeKB * 1024) {
        return err({
            kind: 'FileTooLarge',
            sizeKB: Math.ceil(file.size / 1024),
            maxKB: rules.maxFileSizeKB,
        });
    }
    const allowed = rules.fileTypes.some((entry) => entry === '*/*' || (mime !== '' && (entry === mime || entry === majorWildcard)));
    return allowed ? ok(file) : err({ kind: 'FileTypeNotAllowed', mime });
};