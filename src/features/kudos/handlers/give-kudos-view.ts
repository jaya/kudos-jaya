import logger from '@/utils/logger';
import { GiveKudosService } from '../services/give-kudos.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

const giveKudosViewHandler = withRequestContext(async ({ ack, view, body }) => {
  await ack();

  try {
    const context = RequestContext.get();
    const adapter = context.adapter;

    if (!adapter) {
      throw new Error('Platform adapter not available in request context');
    }

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
      await adapter.postMessage({
        channel: fromId,
        text:
          validation.message ||
          'You have reached your monthly kudos limit. You can give more kudos next month! :pray:',
      });
      return;
    }

    const usersText = users.map((userId) => ` <@${userId}>`);
    const failedUsers = [];

    // Post message to Slack FIRST, before saving to database
    const defaultChannel = await service.getDefaultRecognitionChannel();

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<@${fromId}> is recognizing${usersText.join('')}!*`,
        },
      },
      {
        type: 'image',
        image_url: gif,
        alt_text: 'GIF',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*"${message}"*`,
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

    const { ts, channel } = await adapter.postMessage({
      channel: defaultChannel || fromId,
      text: `<@${fromId}> is recognizing${usersText.join('')}! "${message}"`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blocks: blocks as any,
    });

    // Only create recognitions in DB after Slack post succeeds
    if (ts && channel) {
      const results = await service.createRecognitionsWithSlackIds({
        fromId,
        toIds: users,
        message,
        companyValues,
        slackMessageId: ts,
        slackChannelId: channel,
      });

      // Send notifications to recipients
      for (const result of results) {
        if (result.success) {
          try {
            await adapter.postMessage({
              channel: result.toId,
              text: `Hey <@${result.toId}> Jaya is sending you a gift, check your balance! `,
            });
          } catch (error) {
            logger.error('Failed to send recipient notification', {
              toId: result.toId,
              error,
            });
          }
        } else {
          failedUsers.push(result.toId);
        }
      }
    }

    // Handle failures
    if (failedUsers.length > 0) {
      await adapter.postMessage({
        channel: fromId,
        text: `An error occurred while giving kudos to: ${failedUsers.join(', ')} :cry:`,
      });
    }
  } catch (error) {
    logger.error('giveKudosViewHandler()', error);
  }
});

export default giveKudosViewHandler;
