import { isRecord, readArray, readString } from '#shared';
import { parseFormIntroduction } from "./parseFormIntroduction.js";
import { parseFormPage } from "./parseFormPage.js";
import { parsePromptText } from "./parsePromptText.js";
/**
 * Reads an outbound form, raw (`content[].form`) or formatted (`form`).
 *
 * @param value - Untrusted: `{ introduction?, formPages, receivedMessage?, replyMessage?,
 *   showSummary?, cannedResponseId }`.
 * @returns The form: prompt text from `parsePromptText(value, 'title')`; `introduction` when it
 *   has a non-empty `title` (`imageUrl` → `image`; `buttonText` defaults to `"Start"`); one
 *   page per `formPages` item (`title` `""` when absent) with its `pageComponents` through
 *   `parseFormField` (unknown fields dropped, pages left empty dropped); `showSummary` `true`
 *   only for boolean `true`; `cannedResponseId` (`""` when absent). `undefined` when `value`
 *   is not a record or no page survives (a form reply has `response` and no `formPages`).
 * @remarks Pure. Page and introduction `subtitle`s are copied when non-empty.
 */
export const parseForm = (value) => {
    if (!isRecord(value))
        return undefined;
    const pages = readArray(value, 'formPages')
        .map(parseFormPage)
        .filter((page) => page !== undefined);
    if (pages.length === 0)
        return undefined;
    const introduction = parseFormIntroduction(value['introduction']);
    return {
        ...parsePromptText(value, 'title'),
        ...(introduction ? { introduction } : {}),
        pages,
        showSummary: value['showSummary'] === true,
        cannedResponseId: readString(value, 'cannedResponseId') ?? '',
    };
};