/** A page with no conversation yet: idle, online, nothing in the transcript, the panel closed. */
export const initialConversation = {
    phase: 'idle',
    connection: 'online',
    messages: [],
    pending: [],
    agentTyping: false,
    history: 'available',
    upload: { kind: 'none' },
    answered: [],
    panel: { open: false, view: 'conversation', autoStartSpent: false, launcherRevealed: false },
};