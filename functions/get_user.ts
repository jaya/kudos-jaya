import { SlackAPIClient } from "deno-slack-api/types.ts";

export const getSlackUsername = async (
  client: SlackAPIClient,
  slack_user_id: string,
): Promise<string> => {
  const response = await client.users.info({ user: slack_user_id });
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.user.profile.real_name;
};
