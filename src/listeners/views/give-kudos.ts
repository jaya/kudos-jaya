import { RecognitionController } from '@/controllers/recognition';
import { matchVibe } from '@/utils/find-gif';

const giveKudosViewCallback = async ({ ack, view, client, body }) => {
  await ack();
  const toId = view.state.values['to_id_block']['to_id'].selected_user;
  const channelId =
    view.state.values['kudo_channel_block']['kudo_channel'].selected_channel;
  const message = view.state.values['kudo_message_block']['kudo_message'].value;
  const gif = matchVibe(
    view.state.values['kudo_vibe_block']['kudo_vibe'].value ?? 'plants'
  );
  const fromId = body.user.id;

  const response = await new RecognitionController().save(fromId, toId, client);

  if (!response.ok) {
    await client.chat.postMessage({
      channel: fromId,
      text: `An error occurred while giving <@${toId}> a kudos :cry:`,
    });
  }

  await client.chat.postMessage({
    channel: channelId,
    text:
      `*<@${fromId}> is recognizing <@${toId}>!* :party-jaya:\n` +
      `> ${message}\n` +
      `<${gif.URL}>`,
  });

  await client.chat.postMessage({
    channel: toId,
    text: `Hey <@${toId}> Jaya is sending you a gift, check your balance! `,
  });
};

export default giveKudosViewCallback;
