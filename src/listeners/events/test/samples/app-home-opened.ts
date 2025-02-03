const mockEvent = {
  user: 'U123456',
  view: {
    app_installed_team_id: 'T123456',
  },
  tab: 'home',
};

const adminPanelSectionResponse = [
  {
    text: {
      text: '*My team: (for admins only)*\
Balance to be redeemed: R$ undefined\
Balance redeemed this month: R$ undefined\
Total redeemed: R$ undefined',
      type: 'mrkdwn',
    },
    type: 'section',
  },
  {
    elements: [
      {
        action_id: 'app_settings',
        text: {
          emoji: true,
          text: 'Settings',
          type: 'plain_text',
        },
        type: 'button',
        value: 'origin=home',
      },
      {
        action_id: 'open_prizes_report_modal',
        text: {
          emoji: true,
          text: 'Prizes report',
          type: 'plain_text',
        },
        type: 'button',
      },
    ],
    type: 'actions',
  },
  {
    type: 'divider',
  },
];

const userBalanceSectionResponse = [
  {
    text: {
      text: ':trophy: <@U12345>, your prizes balance :trophy:\
        *Recognitions*: 25\
        *Balance*: R$ 550',
      type: 'mrkdwn',
    },
    type: 'section',
  },
  {
    elements: [
      {
        action_id: 'redeem_button',
        text: {
          emoji: true,
          text: 'Redeem',
          type: 'plain_text',
        },
        type: 'button',
        value: 'open,1',
      },
    ],
    type: 'actions',
  },
  {
    type: 'divider',
  },
];

const recognitionListSectionResponse = [
  {
    text: {
      text: ':sports_medal: #bots 11000 recognitions :sports_medal:',
      type: 'mrkdwn',
    },
    type: 'section',
  },
  {
    text: {
      text: '<@user1>: 5 recognitions',
      type: 'mrkdwn',
    },
    type: 'section',
  },
  {
    text: {
      text: '<@user2>: 3 recognitions',
      type: 'mrkdwn',
    },
    type: 'section',
  },
];

const appHomeResponse = {
  user_id: mockEvent.user,
  view: {
    type: 'home',
    blocks: [
      ...adminPanelSectionResponse,
      ...userBalanceSectionResponse,
      ...recognitionListSectionResponse,
    ],
  },
};

export {
  adminPanelSectionResponse,
  appHomeResponse,
  mockEvent,
  recognitionListSectionResponse,
  userBalanceSectionResponse,
};
