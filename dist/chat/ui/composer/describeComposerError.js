import { strings } from "../strings.js";
/**
 * Words for a composer validation error.
 *
 * @param error - From `validateText` or `validateFile`.
 * @returns The matching `strings` entry; `fileTooLarge` is followed by " " and the limit in MB
 *   (`maxKB / 1024`, up to one decimal, then " MB"), `fileExtensionBlocked` by " " and the
 *   extension.
 * @remarks Pure.
 */
export const describeComposerError = (error) => {
    switch (error.kind) {
        case 'EmptyMessage':
            return strings.emptyMessage;
        case 'MessageTooLong':
            return strings.messageTooLong;
        case 'FileEmpty':
            return strings.fileEmpty;
        case 'FileTooLarge':
            return `${strings.fileTooLarge} ${Math.round((error.maxKB / 1024) * 10) / 10} MB`;
        case 'FileTypeNotAllowed':
            return strings.fileTypeNotAllowed;
        case 'FileExtensionMissing':
            return strings.fileExtensionMissing;
        case 'FileExtensionBlocked':
            return `${strings.fileExtensionBlocked} ${error.extension}`;
    }
};