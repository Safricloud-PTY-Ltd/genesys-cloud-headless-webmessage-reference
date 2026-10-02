/*
 * What the demo bot sends, as raw Guest API content items (docs/guides/structured-messages.md),
 * so the demo runs the same parsers and renderers as a real deployment. URLs point at
 * `demo.invalid`, which never resolves: the demo makes no network requests. For that reason it
 * sends no images, which could only show as broken.
 */
/** The demo's scripted content, keyed by the keyword that asks for it. */
export const demoContent = {
    keywords: ['card', 'carousel', 'date', 'list', 'form', 'markdown', 'file', 'bye'],
    menu: 'Hi! I’m the demo bot. Try one of these, or type it:',
    goodbye: 'Thanks for chatting. This conversation is now closed.',
    markdown: 'Genesys rich text: *bold*, _italic_, ~strike~, ==highlight==, `code`, a [link](https://www.genesys.com) and a bare URL https://developer.genesys.cloud.\n```\nconst block = "code";\n```\n<b>HTML stays text.</b>',
    card: {
        contentType: 'Card',
        card: {
            title: 'Starter plan',
            description: 'For small teams.',
            actions: [
                { type: 'Postback', text: 'Choose Starter plan', payload: 'STARTER' },
                { type: 'Link', text: 'Read more', url: 'https://demo.invalid/starter' },
            ],
        },
    },
    carousel: {
        contentType: 'Carousel',
        carousel: {
            cards: [
                {
                    title: 'Starter plan',
                    description: 'For small teams.',
                    actions: [
                        { type: 'Postback', text: 'Choose Starter plan', payload: 'STARTER' },
                        { type: 'Link', text: 'Read more', url: 'https://demo.invalid/starter' },
                    ],
                },
                {
                    title: 'Growth plan',
                    description: 'For growing teams.',
                    actions: [
                        { type: 'Postback', text: 'Choose Growth plan', payload: 'GROWTH' },
                        { type: 'Link', text: 'Read more', url: 'https://demo.invalid/growth' },
                    ],
                },
                {
                    title: 'Enterprise plan',
                    description: 'For large organisations.',
                    actions: [
                        { type: 'Postback', text: 'Choose Enterprise plan', payload: 'ENTERPRISE' },
                        { type: 'Link', text: 'Read more', url: 'https://demo.invalid/enterprise' },
                    ],
                },
            ],
        },
    },
    file: {
        contentType: 'Attachment',
        attachment: {
            id: 'demo-file',
            mediaType: 'File',
            mime: 'application/pdf',
            filename: 'getting-started.pdf',
            fileSize: 48213,
            url: 'https://demo.invalid/getting-started.pdf',
        },
    },
    list: {
        contentType: 'ListPicker',
        listPicker: {
            sections: [
                {
                    title: 'Topic',
                    multipleSelection: false,
                    items: [
                        { id: 'billing', title: 'Billing', subtitle: 'Invoices and payments' },
                        { id: 'technical', title: 'Technical support' },
                    ],
                },
                {
                    title: 'Contact me by',
                    multipleSelection: true,
                    items: [
                        { id: 'email', title: 'Email' },
                        { id: 'phone', title: 'Phone' },
                    ],
                },
            ],
            receivedMessage: { title: 'How can we help?', subtitle: 'Pick a topic and a channel.' },
            replyMessage: { title: 'Thanks', subtitle: 'Here is what I chose' },
        },
    },
    form: {
        contentType: 'Form',
        form: {
            cannedResponseId: 'demo-canned-response',
            showSummary: true,
            introduction: {
                title: 'Book a callback',
                subtitle: 'Two quick questions.',
                buttonText: 'Start',
            },
            receivedMessage: { title: 'Book a callback', subtitle: 'It takes a minute.' },
            replyMessage: { title: 'Callback booked' },
            formPages: [
                {
                    title: 'About you',
                    subtitle: 'So we know who to ask for.',
                    pageComponents: [
                        {
                            formComponentType: 'Input',
                            input: { id: 'name', title: 'Your name', isRequired: true, isMultipleLine: false },
                        },
                        {
                            formComponentType: 'Input',
                            input: {
                                id: 'notes',
                                title: 'Anything else?',
                                isRequired: false,
                                isMultipleLine: true,
                            },
                        },
                    ],
                },
                {
                    title: 'When',
                    subtitle: 'Choose a day and a time of day.',
                    pageComponents: [
                        {
                            formComponentType: 'DatePicker',
                            datePicker: { id: 'day', title: 'Day', dateDisplayFormat: 'dayMonthYear' },
                        },
                        {
                            formComponentType: 'WheelPicker',
                            wheelPicker: {
                                id: 'slot',
                                items: [
                                    { id: 'morning', title: 'Morning' },
                                    { id: 'afternoon', title: 'Afternoon' },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
    },
};