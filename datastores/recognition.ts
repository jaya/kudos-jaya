import { SlackAPIClient } from "deno-slack-api/types.ts";

export type Recognition = {
  id: string;
  from_id: string;
  from_name: string;
  to_id: string;
  to_name: string;
};

export default class RecognitionDatastore {
  private static readonly DATASTORE_NAME = "recognition";

  static save = async (
    client: SlackAPIClient,
    recognition: Omit<Recognition, "from_name" | "to_name">,
  ): Promise<boolean> => {
    console.log("[RecognitionDatastore.save]", recognition);
    const ret = await client.apps.datastore.put({
      datastore: this.DATASTORE_NAME,
      item: recognition,
    });
    if (!ret.ok) throw new Error(ret.error);
    return ret.ok;
  };
}
