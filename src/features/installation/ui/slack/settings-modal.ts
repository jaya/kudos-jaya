import { CurrentSettingsResponse } from '../../types';

export function buildSettingsModal(
  settings: CurrentSettingsResponse,
  auditorUserIds: string[],
) {
  return {
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
        optional: settings.alreadyInstalled,
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
          text: settings.giftCardApiTokenHint,
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'setup_default_channel_id',
        optional: settings.alreadyInstalled,
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
          text: settings.defaultChannelHint,
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'setup_default_amount',
        optional: settings.alreadyInstalled,
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
          text: settings.defaultAmountHint,
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
          text: settings.companyValuesHint,
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'setup_monthly_kudos_limit',
        optional: true,
        element: {
          type: 'number_input',
          is_decimal_allowed: false,
          action_id: 'monthly_kudos_limit',
          min_value: '1',
        },
        label: {
          type: 'plain_text',
          text: 'Monthly kudos limit per user',
          emoji: true,
        },
        hint: {
          type: 'plain_text',
          text: settings.monthlyKudosLimitHint,
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
          initial_users: auditorUserIds,
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
  };
}
