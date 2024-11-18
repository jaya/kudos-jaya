import { RecognitionController } from '@/controllers/recognition';
import { matchVibe } from '@/utils/find-gif';
import logger from '@/utils/logger';
import config from 'config';

const giveKudosViewCallback = async ({ ack, view, client, body }) => {
  await ack();
  try {
    const users = view.state.values['to_id_block']['to_id'].selected_users;

    const channelId = config.get<string>('app.recognition.defaultChannel');

    const message =
      view.state.values['kudo_message_block']['kudo_message'].value;
    const gif = matchVibe(
      view.state.values['kudo_vibe_block']['kudo_vibe'].value ?? 'plants'
    );
    const fromId = body.user.id;

    const usersText = [];

    for (const toId of users) {
      const response = await new RecognitionController().save(
        fromId,
        toId,
        message
      );

      if (!response.ok) {
        await client.chat.postMessage({
          channel: fromId,
          text: `An error occurred while giving <@${toId}> a kudos :cry:`,
        });
        return;
      }

      await client.chat.postMessage({
        channel: toId,
        text: `Hey <@${toId}> Jaya is sending you a gift, check your balance! `,
      });

      usersText.push(` <@${toId}>`);
    }

    await client.chat.postMessage({
      channel: channelId,
      text:
        `*<@${fromId}> is recognizing${usersText}!* :party-jaya:\n` +
        `> ${message}\n` +
        `<${gif.URL}>`,
    });
  } catch (e) {
    logger.error('giveKudosViewCallback()', { error: e });
  }
};

export default giveKudosViewCallback;
