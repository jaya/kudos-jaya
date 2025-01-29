import logger from '@/utils/logger';

const prizesReportModalCallback = async ({ ack, client, body }) => {
  try {
    await ack();

    const d = new Date();
    const endDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'generate_prizes_report',
        title: {
          type: 'plain_text',
          text: 'Prizes report',
        },
        blocks: [
          {
            type: 'actions',
            block_id: 'report_dates',
            elements: [
              {
                type: 'datepicker',
                initial_date: '2024-01-01',
                placeholder: {
                  type: 'plain_text',
                  text: 'Select a date',
                  emoji: true,
                },
                action_id: 'report_start_date',
              },
              {
                type: 'datepicker',
                initial_date: endDate,
                placeholder: {
                  type: 'plain_text',
                  text: 'Select a date',
                  emoji: true,
                },
                action_id: 'report_end_date',
              },
            ],
          },
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
      },
    });
  } catch (error) {
    logger.error(
      'prizesReportModalCallback() - Error trying to build structure',
      {
        error,
      }
    );
  }
};

export default prizesReportModalCallback;
