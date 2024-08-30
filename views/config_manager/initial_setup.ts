export const renderConfigurationView = () => {
  return {
    "type": "modal",
    "callback_id": "initial_configuration_view",
    "title": {
      "type": "plain_text",
      "text": "Configure Kudos App",
    },
    "close": {
      "type": "plain_text",
      "text": "Cancel",
    },
    "submit": {
      "type": "plain_text",
      "text": "Save",
    },
    "blocks": [
      {
        "type": "input",
        "block_id": "set_token_block",
        "label": {
          "type": "plain_text",
          "text": "Set the smash API token",
        },
        "element": {
          "type": "plain_text_input",
          "action_id": "smash_api_token_value",
        },
      },
    ],
  };
};
