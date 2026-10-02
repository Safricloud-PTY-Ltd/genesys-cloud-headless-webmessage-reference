/**
 * Makes a transcript follow new content the way a chat should: stay at the bottom while the reader
 * is there, and stay put once they scroll up to read.
 *
 * @param scroller - The element that scrolls.
 * @param content - The element whose size changes as rows arrive and images load.
 * @returns A follower. "Following" starts `true` and is updated by every `scroll` event on
 *   `scroller`: `true` when the bottom is within 1 px (zoomed displays report fractions). `pin`
 *   scrolls `scroller` to its `scrollHeight` with `behavior: 'instant'` while following. When
 *   `ResizeObserver` exists, a change in `content`'s size also pins while following.
 * @remarks Reads layout, so call `pin` after everything around the scroller has been drawn: a
 *   typing indicator or quick replies appearing below it shrink it.
 */
export const makeScrollFollower = (scroller, content) => {
    // The reader's position is the one thing that outlives a call, so it lives in this cell.
    const cell = { following: true };
    scroller.addEventListener('scroll', () => {
        // One pixel of slack: zoomed displays report fractional scroll positions.
        cell.following = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= 1;
    });
    const follower = {
        pin: () => {
            if (!cell.following)
                return;
            const top = scroller.scrollHeight;
            // Older engines lack Element.scrollTo; plain scrollTop is the same jump.
            if (typeof scroller.scrollTo === 'function')
                scroller.scrollTo({ top, behavior: 'instant' });
            else
                scroller.scrollTop = top;
        },
    };
    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(() => {
            follower.pin();
        }).observe(content);
    }
    return follower;
};