const MEDIA_TYPES = [
    'Image',
    'Video',
    'Audio',
    'File',
    'Link',
];
/**
 * Reads an attachment's media type, shared by both message shapes.
 *
 * @param value - Untrusted.
 * @returns `value` when it is one of `Image`, `Video`, `Audio`, `File`, `Link`; otherwise `File`.
 * @remarks Pure. Part of `parseAttachment` and `parseFormattedFile`; tested through them.
 */
export const toMediaType = (value) => {
    return MEDIA_TYPES.find((known) => known === value) ?? 'File';
};