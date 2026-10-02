/**
 * Merges newly delivered messages into the transcript. The SDK repeats messages (`restored` is
 * a snapshot replayed after every reconnect) and delivers history newest-first, so the transcript
 * is a set keyed by `id` and sorted by time, never an append-only list.
 *
 * @param existing - The current transcript: oldest first, one entry per id. May be empty.
 * @param incoming - Messages from one event, in any order, possibly repeating ids among
 *   themselves or with `existing`. May be empty.
 * @returns Every id from both, once. Where an id is in both, the `incoming` message replaces the
 *   existing one (it is newer information: a fresh attachment URL, a `consumed` flag); where an id
 *   repeats within `incoming`, the last one wins. Sorted by `time` ascending, ties broken by `id`
 *   in code-unit order.
 * @remarks Pure. Idempotent (`merge(merge(a, b), b)` equals `merge(a, b)`), and, when the ids in
 *   `incoming` are unique, the result does not depend on the order of `incoming`. O((n + m) log(n + m)).
 */
export const mergeMessages = (existing, incoming) => {
    const byId = new Map([...existing, ...incoming].map((m) => [m.id, m]));
    return Array.from(byId.values()).toSorted((a, b) => a.time !== b.time ? a.time - b.time : a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
};