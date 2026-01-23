import { RecognitionController } from '@/controllers';
import { Recognition } from '@/entities';
import logger from '@/utils/logger';
import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { ViewsOpenArguments } from '@slack/web-api';
import { IsNull, Not } from 'typeorm';

const cancelKudosCommandCallback = async ({
  ack,
  client,
  body,
  context,
}: AllMiddlewareArgs & SlackCommandMiddlewareArgs) => {
  try {
    await ack();
    const teamId = body.team_id;
    const fromId = body.user_id;

    const recognitions = await new RecognitionController().find({
      teamId,
      params: { fromId, slackMessageId: Not(IsNull()) as unknown as string },
    });

    if (recognitions.length <= 0) {
      await client.chat.postEphemeral({
        token: context.botToken,
        channel: body.user_id,
        user: body.user_id,
        text: 'You have no kudos to cancel.',
      });
      return;
    }

    await client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: getCancelKudosView(recognitions),
    });
  } catch (error) {
    logger.error('cancelKudosCommandCallback()', error);
  }
};

export function getCancelKudosView(
  recognitions: Recognition[],
): ViewsOpenArguments['view'] {
  const grouped = Object.values(
    recognitions.reduce(
      (acc, { slackMessageId, description, teamId, toId, slackChannelId }) => {
        acc[slackMessageId] ??= {
          description,
          teamId,
          toIds: new Set(),
          slackMessageId,
          slackChannelId,
        };
        acc[slackMessageId].toIds.add(` <@${toId}>`);
        return acc;
      },
      {} as Record<
        string,
        {
          description: string;
          teamId: string;
          toIds: Set<string>;
          slackMessageId: string;
          slackChannelId: string;
        }
      >,
    ),
  ).map(({ toIds, ...rest }) => ({ ...rest, toIds: Array.from(toIds) }));

  const options = grouped.map(
    ({ toIds, description, slackChannelId, slackMessageId }) => {
      return {
        text: {
          type: 'mrkdwn',
          text: `${toIds}\nDescription: ${description}`.slice(0, 147) + '...',
        },
        value: `${slackMessageId},${slackChannelId}`,
      };
    },
  );

  const blocks = [
    {
      block_id: 'cancel_kudos_block',
      type: 'input',
      label: {
        type: 'plain_text',
        text: 'Select the kudos you want to cancel',
      },
      element: {
        type: 'checkboxes',
        options,
        action_id: 'cancel_kudos',
      },
    },
  ];

  return {
    type: 'modal',
    callback_id: 'cancel_selected_kudos',
    title: { type: 'plain_text', text: 'Cancel Kudos', emoji: true },
    close: { type: 'plain_text', text: 'Close', emoji: true },
    blocks,
    submit: {
      type: 'plain_text',
      text: 'Cancel selected',
    },
  };
}

export default cancelKudosCommandCallback;
