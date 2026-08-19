export interface CompanyValueOption {
  text: {
    type: string;
    text: string;
    emoji: boolean;
  };
  value: string;
}

export function buildCompanyValueOptions(
  companyValues?: string,
): CompanyValueOption[] {
  if (!companyValues) {
    return [];
  }

  const separatedValues = companyValues.split(',');
  return separatedValues.map((value, index) => ({
    text: {
      type: 'plain_text',
      text: value.trim(),
      emoji: true,
    },
    value: index.toString(),
  }));
}

export function getKudosView(
  gif: string,
  companyValues: CompanyValueOption[],
  maxSelectedItems?: number,
): Record<string, unknown> {
  const blocks: Array<Record<string, unknown>> = [];

  blocks.push(
    {
      block_id: 'to_id_block',
      type: 'input',
      element: {
        focus_on_load: true,
        type: 'multi_users_select',
        placeholder: {
          type: 'plain_text',
          text: 'Select users',
          emoji: false,
        },
        action_id: 'to_id',
        ...(maxSelectedItems !== undefined && {
          max_selected_items: maxSelectedItems,
        }),
      },
      label: {
        type: 'plain_text',
        text: 'Select the colleagues who deserved a kudos',
        emoji: true,
      },
    },
    {
      type: 'input',
      block_id: 'kudo_message_block',
      label: {
        type: 'plain_text',
        text: 'What would you like to say?',
      },
      element: {
        type: 'plain_text_input',
        action_id: 'kudo_message',
        multiline: true,
      },
    },
  );

  if (companyValues?.length > 0) {
    blocks.push({
      type: 'input',
      block_id: 'company_values_block',
      optional: true,
      element: {
        type: 'multi_static_select',
        placeholder: {
          type: 'plain_text',
          text: 'Select the company values',
          emoji: true,
        },
        options: companyValues,
        action_id: 'company_values_select_action',
      },
      label: {
        type: 'plain_text',
        text: 'Select the company values related to this kudos',
        emoji: true,
      },
    });
  }

  blocks.push(
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'The gif below will be sent with the kudo',
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Get Another gif',
          emoji: true,
        },
        value: 'get_another_gif',
        action_id: 'get_another_gif',
      },
    },
    {
      type: 'image',
      block_id: 'gif_block',
      image_url: gif,
      alt_text: 'Gif image that will be sent',
    },
  );

  return {
    type: 'modal',
    callback_id: 'give_kudos_view',
    title: {
      type: 'plain_text',
      text: 'Give someone kudos',
    },
    blocks,
    submit: {
      type: 'plain_text',
      text: 'Share',
    },
  };
}
