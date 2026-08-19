import { Recognition } from '@/entities';

export interface GroupedKudos {
  description: string;
  teamId: string;
  toIds: string[];
  slackMessageId: string;
  slackChannelId: string;
}

export function groupKudosByMessage(
  recognitions: Recognition[],
): GroupedKudos[] {
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

  return grouped;
}

export function buildCancelKudosModalOptions(
  kudos: GroupedKudos[],
): Array<{ text: { type: string; text: string }; value: string }> {
  return kudos.map(({ toIds, description, slackChannelId, slackMessageId }) => {
    return {
      text: {
        type: 'mrkdwn',
        text: `${toIds}\nDescription: ${description}`.slice(0, 147) + '...',
      },
      value: `${slackMessageId},${slackChannelId}`,
    };
  });
}

export function getCancelKudosView(
  options: Array<{ text: { type: string; text: string }; value: string }>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = [
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
