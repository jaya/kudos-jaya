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
    '1e3d55d6241c83ef1afef8251e57539d:47d341092d22e19e905d4e35f0aad8951b6054272695c08a173d505ae8976211ef2b0280f6cd1ae9500ddff6755fac34d13b5f6d5c8e7a6eba229cff2fcb43119878ffa89690e1b95082edb8f6aae78eeefc60ca4fc30d0a0ab4b01e801d8bbac6a25a6057972ba3f37307a1f694ace34a140aef2a9701ebe7362578df5bcddd14c7714083a35219eff5c9af01f7d2794aa87626a165d60905027b376463f2f580f4d892e0611ad25591bd26355d3a82',
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
