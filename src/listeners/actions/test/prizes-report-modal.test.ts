import logger from '@/utils/logger';
import prizesReportModalCallback from '../prizes-report-modal';

jest.mock('@/utils/logger');

const ack = jest.fn();
const client = {
  views: {
    open: jest.fn(),
  },
};
const body = {
  trigger_id: 'open_prizes_report_modal',
};

describe('prizesReportModalCallback()', () => {
  it('Should build the prizes report modal successfully', async () => {
    const fixedDate = new Date(2025, 1, 5);
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate);
    await prizesReportModalCallback({ ack, client, body });
    expect(client.views.open.mock.calls[0][0].view).toMatchSnapshot();
  });

  it('Should log the error when fails to mount the component', async () => {
    const error = new TypeError(
      // eslint-disable-next-line quotes
      "Cannot read properties of undefined (reading 'trigger_id')",
    );
    await prizesReportModalCallback({ ack, client, body: undefined });
    expect(logger.error).toHaveBeenCalledWith(
      'prizesReportModalCallback() - Error trying to build structure',
      {
        error: error,
      },
    );
  });
});
