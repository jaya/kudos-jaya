import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";

export const SaveRecognition = DefineFunction({
  callback_id: "save",
  title: "Save recognition",
  description: "Save the recognition",
  source_file: "functions/recognition/save.ts",
  input_parameters: {
    properties: {
      from_id: {
        type: Schema.types.string,
        description: "Id of the user who gave the recognition",
      },

      to_id: {
        type: Schema.types.string,
        description: "ID of the user who will receive the recognition",
      },
    },
    required: ["from_id", "to_id"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

type Recognition = {
  id: string;
  from_id: string;
  from_name: string;
  to_id: string;
  to_name: string;
};

const save = async (
  { from_id, to_id }: Pick<Recognition, "to_id" | "from_id">,
  client: SlackAPIClient,
): Promise<{ success: boolean }> => {
  try {
    const fromUserInfo = await client.users.info({ user: from_id });
    const toUserInfo = await client.users.info({ user: to_id });

    if (fromUserInfo.ok && toUserInfo.ok) {
      const from_name = fromUserInfo.user.profile.real_name;
      const to_name = toUserInfo.user.profile.real_name;

      //await save in db all user info
      console.log({
        id: crypto.randomUUID(),
        from_id,
        from_name,
        to_id,
        to_name,
      });
    }

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export default SlackFunction(SaveRecognition, ({ inputs, client }) => {
  const success = save({ ...inputs }, client);
  return { outputs: success };
});
