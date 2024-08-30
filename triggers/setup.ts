import { Trigger } from "deno-slack-sdk/types.ts";
import { SetupWorkflow } from "../workflows/setup.ts";

const setupTrigger: Trigger<typeof SetupWorkflow.definition> = {
  type: "shortcut",
  name: "Setup Kudos Trigger",
  workflow: `#/workflows/${SetupWorkflow.definition.callback_id}`,
  inputs: {
    "user_id": {
      "value": "{{data.user_id}}",
    },
    "interactivity_context": {
      "value": "{{data.interactivity}}",
    },
  },
};

export default setupTrigger;
