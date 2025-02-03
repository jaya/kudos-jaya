import { TransactionController } from '@/controllers';
import { fetchPrizesReportResponse } from '@/controllers/test/samples/transaction';
import logger from '@/utils/logger';
import { uploadFile } from '@/utils/upload-files-slack';
import { writeCsv } from '@/utils/write-csv';
import generatePrizesReportCallback from '../generate-prizes-report';

jest.mock('@/controllers/installation');
jest.mock('@/utils/upload-files-slack');
jest.mock('@/utils/write-csv');
jest.mock('@/utils/logger');
const mockAck = jest.fn();

const mockClient = {
  chat: {
    postMessage: jest.fn(),
  },
  token: 'bot-token-test-mock',
};

describe('generatePrizesReportCallback()', () => {
  const view = {
    state: {
      values: {
        report_dates: {
          report_start_date: {
            selected_date: 'data aqui',
          },
          report_end_date: {
            selected_date: 'data',
          },
        },
      },
    },
  };
  const body = {
    user: {
      id: 'U12345',
      team_id: 'TEAM1234',
    },
  };

  const fileUrl = 'https://slack.com/my-file';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When generating a report successfully', () => {
    describe('When there is data to generate the report', () => {
      it('Should generate a CSV and send to the user throught message', async () => {
        jest
          .spyOn(TransactionController.prototype, 'fetchPrizesReport')
          .mockResolvedValueOnce(fetchPrizesReportResponse);
        (writeCsv as jest.Mock).mockResolvedValueOnce(undefined);
        (uploadFile as jest.Mock).mockResolvedValueOnce(fileUrl);

        await generatePrizesReportCallback({
          ack: mockAck,
          view,
          client: mockClient,
          body,
        });
        expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
          channel: body.user.id,
          text: 'Here is the report',
          attachments: [
            {
              fallback: 'You cannot visualize the csv file.',
              text: 'Click on the file to visualize.',
              actions: [
                {
                  type: 'button',
                  text: 'Open',
                  url: fileUrl,
                },
              ],
            },
          ],
        });
      });
    });

    describe('When there is no data to generate the report', () => {
      it('Should not generate the CSV and send a message informing the user', async () => {
        jest
          .spyOn(TransactionController.prototype, 'fetchPrizesReport')
          .mockResolvedValueOnce([]);

        await generatePrizesReportCallback({
          ack: mockAck,
          view,
          client: mockClient,
          body,
        });
        expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
          channel: body.user.id,
          text: 'Sorry, we do not have enough data to generate the report yet',
        });
      });
    });
  });

  describe('When there is an error generating the csv', () => {
    it('Should log the error and send a message informing the user', async () => {
      const error = new Error();
      jest
        .spyOn(TransactionController.prototype, 'fetchPrizesReport')
        .mockResolvedValueOnce(fetchPrizesReportResponse);
      (writeCsv as jest.Mock).mockRejectedValueOnce(error);

      await generatePrizesReportCallback({
        ack: mockAck,
        view,
        client: mockClient,
        body,
      });

      expect(mockClient.chat.postMessage).toHaveBeenCalledWith({
        channel: body.user.id,
        text: 'Sorry, we had a trouble generating the report',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Error while generating the report',
        { error }
      );
    });
  });

  describe('When there is a non mapped error', () => {
    it('Should log the error', async () => {
      const error = new Error();
      jest
        .spyOn(TransactionController.prototype, 'fetchPrizesReport')
        .mockRejectedValueOnce(error);

      await generatePrizesReportCallback({
        ack: mockAck,
        view,
        client: mockClient,
        body,
      });

      expect(logger.error).toHaveBeenCalledWith(
        'generatePrizesReportCallback()',
        { error }
      );
    });
  });
});
