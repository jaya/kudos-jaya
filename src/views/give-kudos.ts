import { Giphy } from '../clients/giphy/giphy';

export const openKudosView = async ({ client, body, context }) => {
  const gif = await new Giphy().fetchGif();

  await client.views.open({
    token: context.botToken,
    trigger_id: body.trigger_id,
    view: getKudosView(gif),
  });
};

export const getKudosView = (gif: string) => ({
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
  ],
  submit: {
    type: 'plain_text',
    text: 'Share',
  },
});

export const handleGetAnotherGif = async ({ client, body, context, ack }) => {
  await ack();
  const gif = await new Giphy().fetchGif();

  await client.views.update({
    token: context.botToken,
    view_id: body.view.id,
    view: {
      type: 'modal',
      callback_id: 'give_kudos_view',
      title: {
        type: 'plain_text',
        text: 'Give someone kudos',
      },
      blocks: [
        ...body.view.blocks.map((block) =>
          block.block_id === 'gif_block'
            ? {
                type: 'image',
                block_id: 'gif_block',
                image_url: gif,
                alt_text: 'Gif image that will be sent',
              }
            : block,
        ),
      ],
      submit: {
        type: 'plain_text',
        text: 'Share',
      },
    },
  });
};
