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
        {
          type: 'input',
          block_id: 'kudo_vibe_block',
          label: {
            type: 'plain_text',
            text: 'What is this kudo\'s "vibe"?',
          },
          element: {
            type: 'static_select',
            action_id: 'kudo_vibe',
            options: [
              {
                text: {
                  type: 'plain_text',
                  text: 'Appreciation for someone 🫂',
                },
                value: 'appreciation',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'Celebrating a victory 🏆',
                },
                value: 'victory',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'Thankful for great teamwork ⚽️',
                },
                value: 'teamwork',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'Amazed at awesome work ☄️',
                },
                value: 'awesome_work',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'Excited for the future 🎉',
                },
                value: 'future',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'No vibes, just plants 🪴',
                },
                value: 'plants',
              },
            ],
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
