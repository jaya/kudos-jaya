// @ts-ignore
import { Manifest } from "deno-slack-sdk/mod.ts";
// @ts-ignore
import { FindGIFFunction } from "./functions/find_gif.ts";
// @ts-ignore
import { GiveKudosWorkflow } from "./workflows/give_kudos.ts";
// @ts-ignore
import { RecognitionDsDef } from "./datastores/recognition.ts";
import { WalletDsDef } from "./datastores/wallet.ts";
import { WorkspaceDsDef } from "./datastores/workspace.ts";
import { GiveKudosFunction } from "./functions/give_kudos.ts";
import { SetupFunction } from "./functions/setup.ts";
import { RedeemWorkflow } from "./workflows/redeem.ts";
import { SetupWorkflow } from "./workflows/setup.ts";

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
  functions: [
    FindGIFFunction,
    GiveKudosFunction,
    SetupFunction,
  ],
  workflows: [GiveKudosWorkflow, RedeemWorkflow, SetupWorkflow],
  outgoingDomains: [],
  datastores: [RecognitionDsDef, WalletDsDef, WorkspaceDsDef],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "users:read",
    "datastore:write",
    "datastore:read",
    "team:read",
  ],
});
