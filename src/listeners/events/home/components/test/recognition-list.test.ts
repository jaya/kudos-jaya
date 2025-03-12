import { InstallationController, RecognitionController } from '@/controllers';
import { getRecognitionListSection } from '../recognition-list';

jest.mock('@/controllers/installation');
jest.mock('@/controllers/recognition');

describe('getRecognitionListSection()', () => {
  it('Should not return the list of recognitions section if the setup is not complete', async () => {
    jest
      .spyOn(InstallationController.prototype, 'find')
      .mockResolvedValueOnce({ defaultRecognitionChannel: null });

    const recsListSection = await getRecognitionListSection({
      teamId: 'T1234',
    });
    expect(recsListSection).toEqual([]);
  });

  it('Should return the list of recognitions section of the app home page', async () => {
    jest
      .spyOn(InstallationController.prototype, 'find')
      .mockResolvedValueOnce({ defaultRecognitionChannel: '#bots' });
    jest
      .spyOn(RecognitionController.prototype, 'getTotal')
      .mockResolvedValueOnce(11000);
    jest
      .spyOn(RecognitionController.prototype, 'getUsersRecognitionSummary')
      .mockResolvedValueOnce([
        { userId: 'user1', recognitionCount: 5 },
        { userId: 'user2', recognitionCount: 3 },
      ]);

    const recsListSection = await getRecognitionListSection({
      teamId: 'T1234',
    });
    expect(recsListSection).toMatchSnapshot();
  });

  it('Should return the default channel concatenated with #', async () => {
    jest
      .spyOn(InstallationController.prototype, 'find')
      .mockResolvedValueOnce({ defaultRecognitionChannel: 'bots' });
    jest
      .spyOn(RecognitionController.prototype, 'getTotal')
      .mockResolvedValueOnce(11000);
    jest
      .spyOn(RecognitionController.prototype, 'getUsersRecognitionSummary')
      .mockResolvedValueOnce([
        { userId: 'user1', recognitionCount: 5 },
        { userId: 'user2', recognitionCount: 3 },
      ]);

    const recsListSection = await getRecognitionListSection({
      teamId: 'T1234',
    });

    expect(recsListSection[0]).toEqual({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':sports_medal: <#bots> 11000 recognitions :sports_medal:',
      },
    });
  });
});
