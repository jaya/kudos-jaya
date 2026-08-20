/**
 * Google Chat: Give Kudos Modal UI Builder
 *
 * Builds Google Chat Card formatted views for the give-kudos feature
 * (as opposed to Slack Block Kit format)
 *
 * Note: In production, you would use Google Chat Card format:
 * https://developers.google.com/chat/api/guides/message-formats/cards
 */

export interface CompanyValueOption {
  text: string;
  value: string;
}

export function buildCompanyValueOptions(
  companyValues?: string,
): CompanyValueOption[] {
  if (!companyValues) {
    return [];
  }

  const separatedValues = companyValues.split(',');
  return separatedValues.map((value, index) => ({
    text: value.trim(),
    value: index.toString(),
  }));
}

export function getKudosView(
  gif: string,
  companyValues: CompanyValueOption[],
): Record<string, unknown> {
  const sections: Array<Record<string, unknown>> = [];

  // Select recipients section
  sections.push({
    header: 'Give Kudos',
    widgets: [
      {
        textParagraph: {
          text: 'Select the colleagues who deserved a kudos',
        },
      },
      {
        selectionInput: {
          name: 'to_ids',
          label: 'Recipients',
          type: 'CHECKBOX',
          items: [
            // In production: populate with actual user list
            {
              text: 'User Name',
              value: 'user_id',
              selected: false,
            },
          ],
        },
      },
    ],
  });

  // Message section
  sections.push({
    widgets: [
      {
        textInput: {
          name: 'message',
          label: 'What would you like to say?',
          type: 'PARAGRAPH_TEXT',
          placeholder: 'Share your appreciation...',
        },
      },
    ],
  });

  // Company values section
  if (companyValues?.length > 0) {
    sections.push({
      widgets: [
        {
          selectionInput: {
            name: 'company_values',
            label: 'Select the company values related to this kudos',
            type: 'CHECKBOX',
            items: companyValues.map((value) => ({
              text: value.text,
              value: value.value,
              selected: false,
            })),
          },
        },
      ],
    });
  }

  // GIF section with preview
  sections.push({
    widgets: [
      {
        textParagraph: {
          text: 'The gif below will be sent with the kudo',
        },
      },
      {
        image: {
          imageUrl: gif,
        },
      },
      {
        buttonList: {
          buttons: [
            {
              text: 'Get Another GIF',
              onClick: {
                action: {
                  actionMethodName: 'getAnotherGif',
                },
              },
            },
          ],
        },
      },
    ],
  });

  // Submit button section
  sections.push({
    widgets: [
      {
        buttonList: {
          buttons: [
            {
              text: 'Share Kudos',
              onClick: {
                action: {
                  actionMethodName: 'submitKudos',
                },
              },
            },
          ],
        },
      },
    ],
  });

  return {
    cardId: 'give_kudos_card',
    sections,
  };
}
