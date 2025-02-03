import { InstallationController, RecognitionController } from '@/controllers';
import { getRecognitionListSection } from '../recognition-list';

jest.mock('@/controllers/installation');
jest.mock('@/controllers/recognition');

describe('getRecognitionListSection()', () => {
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
});
