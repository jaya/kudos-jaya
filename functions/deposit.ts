import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const DepositFunction = DefineFunction({
  callback_id: "deposit",
  title: "Deposit cash",
  description: "Add money to the user account",
  source_file: "functions/deposit.ts",
  input_parameters: {
    properties: {
      amount: {
        type: Schema.types.number,
        description: "The amount of cash",
      },
      user_id: {
        type: Schema.types.string,
        description: "The user id who will receive",
      },
    },
    required: ["amount", "user_id"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

const deposit = (amount: number, user_id: string): { success: boolean } => {
  console.log("Amount: " + amount);
  console.log("For: " + user_id);
  return { success: true };
};

export default SlackFunction(DepositFunction, ({ inputs }) => {
  const { amount, user_id } = inputs;
  const success = deposit(amount, user_id);
  return { outputs: success };
});
