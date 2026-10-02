/** The trimmed deployment configuration the demo's `GenesysJS.configuration` resolves with. */
export const demoConfiguration = {
    headlessMode: { enabled: true },
    messenger: {
        enabled: true,
        apps: {
            conversations: {
                enabled: true,
                autoStart: { enabled: false },
                showAgentTypingIndicator: true,
                showUserTypingIndicator: true,
                conversationClear: { enabled: true },
                conversationDisconnect: { enabled: true, type: 'ReadOnly' },
            },
        },
        fileUpload: { enableAttachments: true },
    },
};