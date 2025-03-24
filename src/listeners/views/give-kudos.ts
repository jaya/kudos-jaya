import { InstallationController } from '@/controllers/installation';
import { RecognitionController } from '@/controllers/recognition';
import logger from '@/utils/logger';

const giveKudosViewCallback = async ({ ack, view, client, body }) => {
  await ack();
  try {
    const botToken = client.token;
    const fromId = body.user.id;
    const teamId = body.user.team_id;
    const users = view.state.values['to_id_block']['to_id'].selected_users;
    const gif = view.blocks.slice(-1)[0].image_url;
    const message =
      view.state.values['kudo_message_block']['kudo_message'].value;

    const selectedCompanyValues =
      view?.state?.values?.['company_values_block']?.[
        'company_values_select_action'
      ]?.['selected_options'];
    const companyValues =
      selectedCompanyValues?.length > 0
        ? selectedCompanyValues.map((value) => value?.text?.text).join(', ')
        : [];

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

    const blocks = [
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
    ];

    if (companyValues?.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `> ${companyValues}`,
        },
      });
    }

    await client.chat.postMessage({
      channel: defaultRecognitionChannel,
      text: `*<@${fromId}> is recognizing${usersText}!* \n> ${message}`,
      blocks,
    });
  } catch (e) {
    console.log(e);
    logger.error('giveKudosViewCallback()', { error: e });
  }
};

export default giveKudosViewCallback;
