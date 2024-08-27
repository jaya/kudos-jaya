// @ts-ignore
import { Manifest } from "deno-slack-sdk/mod.ts";
// @ts-ignore
import { FindGIFFunction } from "./functions/find_gif.ts";
// @ts-ignore
import { GiveKudosWorkflow } from "./workflows/give_kudos.ts";
// @ts-ignore
import { SaveRecognition } from "./functions/recognition/save.ts";
import { RedeemWorkflow } from "./workflows/redeem.ts";

/**
 * The app manifest contains the app's configuration. This file defines
 * attributes like app name, description, available workflows, and more.
 * Learn more: https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "Kudos Jaya",
  displayName: "Kudos Jaya",
  description: "Brighten someone's day with a heartfelt thank you",
  longDescription:
    "Add a spark to your team’s day with KudosBot. Recognize and celebrate your colleagues’ efforts instantly with a simple command. Boost morale, foster a culture of appreciation, and make every accomplishment shine.\n" +
    "\n" +
    "Because every “thank you” counts. 🌟",
  icon: "assets/icon.png",
  backgroundColor: "#40e0d0",
  functions: [FindGIFFunction, SaveRecognition],
  workflows: [GiveKudosWorkflow, RedeemWorkflow],
  outgoingDomains: [],
  botScopes: ["commands", "chat:write", "chat:write.public", "users:read"],
});
