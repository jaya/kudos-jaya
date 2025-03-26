const giftCardApiTokenHint = 'Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const defaultAmountHint = 'Ex: 100.';
const defaultChannelHint =
  'Enter the default Slack channel id (ex: C93LZNJ64, #bots).';
const alreadyInstalled = false;
const companyValuesHint =
  'The company values to be selected when giving a kudo';

const user1 = {
  id: 'U123456',
  name: 'Name 1',
  email: null,
};

const user2 = {
  id: 'U654321',
  name: 'Name 1',
  email: null,
};

const users = [user1, user2];

const initial_users = [user1.id, user2.id];

const currentSettingsResponse = {
  giftCardApiTokenHint,
  defaultAmountHint,
  defaultChannelHint,
  alreadyInstalled,
  companyValuesHint,
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
      {
        type: 'input',
        block_id: 'setup_company_values',
        optional: true,
        element: {
          type: 'plain_text_input',
          action_id: 'company_values',
        },
        label: {
          type: 'plain_text',
          text: 'The company values to be selected when giving a kudo',
          emoji: true,
        },
        hint: {
          type: 'plain_text',
          text: companyValuesHint,
          emoji: true,
        },
      },
      {
        block_id: 'auditor_users',
        type: 'input',
        optional: true,
        element: {
          focus_on_load: false,
          type: 'multi_users_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select users',
            emoji: false,
          },
          action_id: 'auditor_users',
          initial_users,
        },
        label: {
          type: 'plain_text',
          text: 'Select users who will be notified when someone redeems a card',
        },
      },
    ],
    submit: {
      type: 'plain_text',
      text: 'Finish',
    },
  },
};

export { currentSettingsResponse, responseView, users };
