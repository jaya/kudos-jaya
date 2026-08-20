import logger from '@/utils/logger';
import { GiveKudosService } from '../../services/give-kudos.service';
import { withRequestContext } from '@/context';
import { RequestContext } from '@/context/RequestContext';

interface GoogleChatViewParams {
  userId: string;
  formData: {
    to_ids?: string[];
    message?: string;
    gif_url?: string;
    company_values?: string[];
  };
}

/**
 * Google Chat: Give Kudos View Handler
 *
 * Handles form submission from give-kudos modal in Google Chat
 * Routes through adapter interface for platform-agnostic execution
 */
const giveKudosViewHandler = withRequestContext(
  async ({ userId, formData }: GoogleChatViewParams) => {
    try {
      const context = RequestContext.get();
      const adapter = context.adapter;

      if (!adapter) {
        throw new Error('Platform adapter not available in request context');
      }

      const fromId = userId;
      const service = new GiveKudosService();

      // Extract form values (structure differs from Slack but intent is same)
      const toIds = formData.to_ids || [];
      const message = formData.message || '';
      const gif = formData.gif_url || '';
      const companyValues = formData.company_values?.join(', ') || undefined;

      // Validate monthly limit again
      const validation = await service.validateMonthlyLimit(fromId);
      if (!validation.canGive) {
        await adapter.postMessage({
          channel: fromId,
          text:
            validation.message ||
            'You have reached your monthly kudos limit. You can give more kudos next month! 🙏',
        });
        return;
      }

      const usersText = toIds.map((id) => ` <@${id}>`);
      const failedUsers = [];

      // Post message to Google Chat FIRST, before saving to database
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

      // Only create recognitions in DB after platform post succeeds
      if (ts && channel) {
        const results = await service.createRecognitionsWithSlackIds({
          fromId,
          toIds,
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
                text: `Hey <@${result.toId}> Jaya is sending you a gift, check your balance!`,
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
          text: `An error occurred while giving kudos to: ${failedUsers.join(', ')} 😢`,
        });
      }
    } catch (error) {
      logger.error('giveKudosViewHandler(google-chat)', error);
    }
  },
);

export default giveKudosViewHandler;
