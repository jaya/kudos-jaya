import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SetupFunction } from "../functions/setup.ts";

const SetupWorkflow = DefineWorkflow({
  callback_id: "setup_workflow",
  title: "Setup kudos app",
  description: "Configure the app",
  input_parameters: {
    properties: {
      user_id: {
        description: "User who called the workflow",
        type: Schema.slack.types.user_id,
      },
      interactivity_context: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["user_id", "interactivity_context"],
  },
});

SetupWorkflow.addStep(SetupFunction, {
  interactivity: SetupWorkflow.inputs.interactivity_context,
  user_id: SetupWorkflow.inputs.user_id,
});

export { SetupWorkflow };
