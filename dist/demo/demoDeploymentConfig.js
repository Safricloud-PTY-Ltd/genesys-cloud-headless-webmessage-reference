/**
 * The untrimmed deployment configuration the demo republishes as
 * `GenesysJS.configurationReceived`: what `demoConfiguration` says, plus the look-and-feel fields
 * the documented `GenesysJS.configuration` trims (docs/guides/loading-the-sdk.md). Genesys'
 * default colour and position, the launcher shown as an icon, the home screen on and humanize
 * on, so the demo shows every part of the native look.
 */
export const demoDeploymentConfig = {
    headlessMode: { enabled: true },
    position: { alignment: 'Auto', sideSpace: 20, bottomSpace: 12 },
    messenger: {
        enabled: true,
        styles: { primaryColor: '#0165A7' },
        launcherButton: { visibility: 'On', displayType: 'Icon' },
        homeScreen: { enabled: true },
        apps: {
            conversations: {
                enabled: true,
                autoStart: { enabled: false },
                showAgentTypingIndicator: true,
                showUserTypingIndicator: true,
                conversationClear: { enabled: true },
                conversationDisconnect: { enabled: true, type: 'ReadOnly' },
                humanize: { enabled: true, bot: { name: 'Demo bot' } },
            },
        },
        fileUpload: { enableAttachments: true },
    },
};