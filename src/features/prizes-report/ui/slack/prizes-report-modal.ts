// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPrizesReportView(): any {
  const d = new Date();
  const endDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  return {
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
  };
}
