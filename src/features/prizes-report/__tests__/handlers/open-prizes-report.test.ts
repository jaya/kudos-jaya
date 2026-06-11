import openPrizesReportHandler from '../../handlers/open-prizes-report';
import * as prizesReportModal from '../../ui/prizes-report-modal';

jest.mock('../../ui/prizes-report-modal');
jest.mock('@/utils/logger');

describe('openPrizesReportHandler', () => {
  let mockAck: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBody: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAck = jest.fn().mockResolvedValue(undefined);
    mockClient = {
      views: {
        open: jest.fn(),
      },
    };
    mockBody = {
      trigger_id: 'trigger123',
    };

    (prizesReportModal.getPrizesReportView as jest.Mock).mockReturnValue({
      type: 'modal',
      callback_id: 'generate_prizes_report',
    });
  });

  it('should open prizes report modal', async () => {
    await openPrizesReportHandler({
      ack: mockAck,
      client: mockClient,
      body: mockBody,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(mockAck).toHaveBeenCalled();
    expect(mockClient.views.open).toHaveBeenCalled();
    expect(mockClient.views.open).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_id: 'trigger123',
      }),
    );
  });
});
