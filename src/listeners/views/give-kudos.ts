import { AllMiddlewareArgs, SlackViewMiddlewareArgs } from '@slack/bolt';
import { matchVibe } from '../../utils/find-gif';

const giveKudosViewCallback = async ({
  ack,
  view,
  client,
  body,
}: AllMiddlewareArgs & SlackViewMiddlewareArgs) => {
  await ack();
  const toId = view.state.values['to_id_block']['to_id'].selected_user;
  const channelId =
    view.state.values['kudo_channel_block']['kudo_channel'].selected_channel;
  const message = view.state.values['kudo_message_block']['kudo_message'].value;
  const gif = matchVibe(
    view.state.values['kudo_vibe_block']['kudo_vibe'].value ?? 'plants'
  );
  const fromId = body.user.id;

  await client.chat.postMessage({
    channel: channelId || '',
    text:
      `*<@${fromId}> is recognizing <@${toId}>!* :party-jaya:\n` +
      `> ${message}\n` +
      `<${gif.URL}>`,
  });
};

export default giveKudosViewCallback;
