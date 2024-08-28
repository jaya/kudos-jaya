import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import RecognitionDatastore, {
  Recognition,
} from "../datastores/recognition.ts";
import WalletDataStore, { Deposit } from "../datastores/wallet.ts";
import { getSlackUsername } from "./get_user.ts";

export const GiveKudosFunction = DefineFunction({
  callback_id: "give_kudos_function",
  title: "Give Kudos",
  source_file: "functions/give_kudos.ts",
  input_parameters: {
    properties: {
      from_id: {
        type: Schema.slack.types.user_id,
      },
      to_id: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["from_id", "to_id"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(GiveKudosFunction, async ({ inputs, client }) => {
  const from_name = await getSlackUsername(client, inputs.from_id);
  const to_name = await getSlackUsername(client, inputs.to_id);
  const recognition: Recognition = {
    id: crypto.randomUUID(),
    from_id: inputs.from_id,
    from_name,
    to_id: inputs.to_id,
    to_name,
  };
  const ok = await RecognitionDatastore.save(client, recognition);
  if (ok) {
    const deposit: Deposit = {
      owner_id: inputs.to_id,
      amount: 100,
    };
    WalletDataStore.deposit(client, deposit);
  }
  return { outputs: true };
});
