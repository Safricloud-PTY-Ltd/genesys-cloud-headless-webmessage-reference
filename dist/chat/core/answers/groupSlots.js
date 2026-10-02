/**
 * Groups date picker slots by the customer's local calendar day, as Genesys' UI does. The day of
 * a slot depends on the time zone, so the caller supplies it.
 *
 * @param slots - Slots, earliest first. May be empty.
 * @param dayOf - The label of the local day a slot falls on, for example from
 *   `Intl.DateTimeFormat`. Slots with equal labels share a group.
 * @returns One group per distinct label, in order of first appearance, each holding its slots in
 *   input order. Empty for no slots.
 * @remarks Pure apart from `dayOf`, which is called once per slot.
 */
export const groupSlots = (slots, dayOf) => {
    return slots.reduce((groups, slot) => {
        const day = dayOf(slot);
        return groups.some((group) => group.day === day)
            ? groups.map((group) => (group.day === day ? { day, slots: [...group.slots, slot] } : group))
            : [...groups, { day, slots: [slot] }];
    }, []);
};