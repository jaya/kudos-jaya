import { InstallationController } from '@/controllers/installation';
import { RecognitionController } from '@/controllers/recognition';
import { Divider, TextSection } from './user-balance';

export async function getRecognitionListSection(params: { teamId: string }) {
  const { teamId } = params;

  const recsController = new RecognitionController();
  const { defaultRecognitionChannel } = await new InstallationController().find(
    teamId,
  );

  if (!defaultRecognitionChannel) return [];

  const totalRecognitions = await recsController.getTotal({ teamId });

  const recognitionSummary =
    await recsController.getUsersRecognitionSummary(teamId);

  const recognitionsList: (Divider | TextSection)[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: defaultRecognitionChannel.startsWith('#')
          ? `:sports_medal: ${defaultRecognitionChannel} ${totalRecognitions} recognitions :sports_medal:`
          : `:sports_medal: <#${defaultRecognitionChannel}> ${totalRecognitions} recognitions :sports_medal:`,
      },
    },
  ];

  for (const recognition of recognitionSummary) {
    const recognitionText = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<@${recognition.userId}>: ${recognition.recognitionCount} recognitions`,
      },
    };

    recognitionsList.push(recognitionText);
  }

  return recognitionsList;
}
