export const storedInstallation = {
  teamId: 'T081PEJ3G9F',
  teamName: 'Jaya Tech Sandbox',
  tokenType: 'bot',
  isEnterpriseInstall: false,
  appId: 'A07N6B9AUNT',
  authVersion: 'v2',
  enterprise: { id: 'E081ZHVA23A', name: 'Jaya Tech Sandbox' },
  bot: {
    id: 'B088DKHPH99',
    token: 'xoxb-8057494118321-8285748747074-MZYhRiXMpBYtuxO5QAd5uQUD',
    scopes: [
      'channels:history',
      'chat:write',
      'chat:write.public',
      'commands',
      'team:read',
      'users:read',
    ],
    userId: 'U088DN0MZ26',
  },
  giftCardApiToken:
    '3bd9cd5a667ff467ab3a8f70edfc70cf:e4b39e68e3a63e1a777b888b19f49796',
  defaultRecognitionChannel: '#bots',
  defaultAmount: 100,
  createdAt: '2025-01-24T16:08:05.970Z',
};

export const installationPayload = {
  team: {
    id: storedInstallation.teamId,
    name: storedInstallation.teamName,
  },
  ...storedInstallation,
};
