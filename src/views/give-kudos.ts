export const openKudosView = async ({ client, body, context }) => {
  await client.views.open({
    token: context.botToken,
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'give_kudos_view',
      title: {
        type: 'plain_text',
        text: 'Give someone kudos',
      },
      blocks: [
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
      ],
      submit: {
        type: 'plain_text',
        text: 'Share',
      },
    },
  });
};
