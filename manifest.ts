// @ts-ignore
import { DefineDatastore, Manifest, Schema } from "deno-slack-sdk/mod.ts";
// @ts-ignore
import { FindGIFFunction } from "./functions/find_gif.ts";
// @ts-ignore
import { GiveKudosWorkflow } from "./workflows/give_kudos.ts";
// @ts-ignore
import { GiveKudosFunction } from "./functions/give_kudos.ts";
import { RedeemWorkflow } from "./workflows/redeem.ts";

export const RecognitionDatastore = DefineDatastore({
  name: "recognition",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    from_id: {
      type: Schema.types.string,
    },
    from_name: {
      type: Schema.types.string,
    },
    to_id: {
      type: Schema.types.string,
    },
    to_name: {
      type: Schema.types.string,
    },
  },
});

export const WalletDataStore = DefineDatastore({
  name: "wallet",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    owner_id: {
      type: Schema.types.string,
    },
    balance: {
      type: Schema.types.number,
    },
  },
});

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
  functions: [FindGIFFunction, GiveKudosFunction],
  workflows: [GiveKudosWorkflow, RedeemWorkflow],
  outgoingDomains: [],
  datastores: [RecognitionDatastore, WalletDataStore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "users:read",
    "datastore:write",
    "datastore:read",
  ],
});
