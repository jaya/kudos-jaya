import logger from '@/utils/logger';
import { GiveKudosService } from '../services/give-kudos.service';
import { withRequestContext } from '@/context';

const giveKudosViewHandler = withRequestContext(async ({ ack, view, client, body }) => {
  await ack();

  try {
    const fromId = body.user.id;
    const service = new GiveKudosService();

    // Extract form values
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
        : undefined;

    // Validate monthly limit again
    const validation = await service.validateMonthlyLimit(fromId);
    if (!validation.canGive) {
      await client.chat.postMessage({
        channel: fromId,
        text:
          validation.message ||
          'You have reached your monthly kudos limit. You can give more kudos next month! :pray:',
      });
      return;
    }

    // Create recognitions for all users
    const results = await service.createRecognitions({
      fromId,
      toIds: users,
      message,
      companyValues,
    });

    const usersText = [];
    const failedUsers = [];

    for (const result of results) {
      if (result.success) {
        usersText.push(` <@${result.toId}>`);

        // Send notification to recipient
        await client.chat.postMessage({
          channel: result.toId,
          text: `Hey <@${result.toId}> Jaya is sending you a gift, check your balance! `,
        });
      } else {
        failedUsers.push(result.toId);
      }
    }

    // Send confirmation message with GIF
    if (usersText.length > 0) {
      const defaultChannel = await service.getDefaultRecognitionChannel();

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
            text: `Kudos given to${usersText.join('')}! *"${message}"*`,
          },
        },
      ];

      if (companyValues) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Company Values:* ${companyValues}`,
          },
        });
      }

      await client.chat.postMessage({
        channel: defaultChannel || fromId,
        blocks,
      });
    }

    // Handle failures
    if (failedUsers.length > 0) {
      await client.chat.postMessage({
        channel: fromId,
        text: `An error occurred while giving kudos to: ${failedUsers.join(', ')} :cry:`,
      });
    }
  } catch (error) {
    logger.error('giveKudosViewHandler()', error);
  }
});

export default giveKudosViewHandler;
