/**
 * Lists the labels a customer chose in a list picker or form, under their answer's text.
 *
 * @param answers - The chosen labels, in order; `undefined` or empty when there are none.
 * @param document - The document to create elements with.
 * @returns `[]` when `answers` is `undefined` or empty; otherwise one `<ul class="answers">` with
 *   one `<li dir="auto">` per answer, in order, holding the label as plain text.
 * @remarks Sets no `innerHTML`. Part of `renderMessage`; tested through it.
 */
export const renderAnswers = (answers, document) => {
    if (answers === undefined || answers.length === 0) {
        return [];
    }
    const list = document.createElement('ul');
    list.className = 'answers';
    list.append(...answers.map((answer) => {
        const entry = document.createElement('li');
        entry.setAttribute('dir', 'auto');
        entry.textContent = answer;
        return entry;
    }));
    return [list];
};