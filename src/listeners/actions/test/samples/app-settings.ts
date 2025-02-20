const giftCardApiTokenHint = 'Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const defaultAmountHint = 'Ex: 100.';
const defaultChannelHint =
  'Enter the default Slack channel id (ex: C93LZNJ64, #bots).';
const alreadyInstalled = false;

const currentSettingsResponse = {
  giftCardApiTokenHint,
  defaultAmountHint,
  defaultChannelHint,
  alreadyInstalled,
};

const responseView = {
  view: {
    type: 'modal',
    callback_id: 'settings_view',
    title: {
      type: 'plain_text',
      text: 'App Settings',
    },
    blocks: [
      {
        type: 'input',
        block_id: 'setup_todo_token',
        optional: alreadyInstalled,
        label: {
          type: 'plain_text',
          text: 'Fill in the field below with the token provided by Todo Cartões',
        },
        element: {
          type: 'plain_text_input',
          action_id: 'todo_token',
          multiline: true,
        },
        hint: {
          type: 'plain_text',
          text: giftCardApiTokenHint,
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'setup_default_channel_id',
        optional: alreadyInstalled,
        element: {
          type: 'plain_text_input',
          action_id: 'default_channel_id',
        },
        label: {
          type: 'plain_text',
          text: 'Default channel for the app to send kudos messages',
          emoji: true,
        },
        hint: {
          type: 'plain_text',
          text: defaultChannelHint,
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'setup_default_amount',
        optional: alreadyInstalled,
        element: {
          type: 'number_input',
          is_decimal_allowed: true,
          action_id: 'default_amount',
          min_value: '10',
        },
        label: {
          type: 'plain_text',
          text: 'Default amount to add to the wallet when someone receives a kudo.',
          emoji: true,
        },
        hint: {
          type: 'plain_text',
          text: defaultAmountHint,
          emoji: true,
        },
      },
    ],
    submit: {
      type: 'plain_text',
      text: 'Finish',
    },
  },
};

export { currentSettingsResponse, responseView };
