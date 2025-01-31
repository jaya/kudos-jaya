import { Giphy } from '@/clients/giphy/giphy';
import { InstallationController } from '@/controllers/installation';
import { RecognitionController } from '@/controllers/recognition';
import logger from '@/utils/logger';

const giveKudosViewCallback = async ({ ack, view, client, body }) => {
  await ack();
  try {
    const botToken = client.token;
    const users = view.state.values['to_id_block']['to_id'].selected_users;

    const message =
      view.state.values['kudo_message_block']['kudo_message'].value;
    const gif = await new Giphy().fetchGif();
    const fromId = body.user.id;
    const teamId = body.user.team_id;

    const { defaultRecognitionChannel } =
      await new InstallationController().find(teamId);

    const usersText = [];

    for (const toId of users) {
      const response = await new RecognitionController().save({
        fromId,
        toId,
        message,
        teamId,
        botToken,
      });

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
      channel: defaultRecognitionChannel,
      text: `*<@${fromId}> is recognizing${usersText}!* \n> ${message}`,
      blocks: [
        {
          type: 'image',
          image_url: gif,
          alt_text: 'GIF',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<@${fromId}> is recognizing${usersText}!* \n${message}`,
          },
        },
      ],
    });
  } catch (e) {
    logger.error('giveKudosViewCallback()', { error: e });
  }
};

export default giveKudosViewCallback;
