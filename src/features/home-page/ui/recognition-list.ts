import { InstallationController } from '@/controllers/installation';
import { RecognitionController } from '@/controllers/recognition';
import { Divider, TextSection } from './types';

export async function getRecognitionListSection(params: {
  teamId: string;
}): Promise<(Divider | TextSection)[]> {
  const { teamId } = params;

  const recsController = new RecognitionController();
  const { defaultRecognitionChannel } = await new InstallationController().find(
    teamId,
  );

  if (!defaultRecognitionChannel) return [];

  const totalRecognitions = await recsController.getTotal({ teamId });

  const recognitionSummary =
    await recsController.getUsersRecognitionSummary(teamId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionsList: any[] = [
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
