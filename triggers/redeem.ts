import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import {RedeemWorkflow} from "../workflows/redeem.ts";

/**
 * Triggers determine when workflows are executed. A trigger file describes a
 * scenario in which a workflow should be run, such as a user clicking a link.
 * Learn more: https://api.slack.com/automation/triggers/link
 */
const redeemTrigger: Trigger<typeof RedeemWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Redeem Kudos",
  description: "Select a store to claim you gift",
  workflow: `#/workflows/${RedeemWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
  },
};

export default redeemTrigger;
