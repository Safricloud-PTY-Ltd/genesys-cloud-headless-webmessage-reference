import { err, ok } from '#shared';
import { unknownEnvironment } from "../../types.js";
import { scriptHosts } from "./scriptHosts.js";
/**
 * Checks a Messenger `environment` value against the regions this reference knows.
 *
 * @param value - The value from page configuration, for example `prod-euw1`. Matched exactly:
 *   case, surrounding whitespace and the SDK's undocumented aliases (`euw1`) are rejected.
 * @returns The value as an `Environment`.
 * @errors UnknownEnvironment - when `value` is not a key of the region table, carrying `value`.
 * @remarks Pure.
 */
export const toEnvironment = (value) => {
    // hasOwn, not `in`: inherited names such as `toString` are not regions.
    return Object.hasOwn(scriptHosts, value)
        ? ok(value)
        : err(unknownEnvironment(value));
};