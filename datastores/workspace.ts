import { SlackAPIClient } from "deno-slack-sdk/deps.ts";
import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const WorkspaceDsDef = DefineDatastore({
  name: "workspace",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    slack_id: {
      type: Schema.types.string,
    },
    name: {
      type: Schema.types.string,
    },
    smash_token: {
      type: Schema.types.string,
    },
  },
});

export type Workspace = {
  id: string;
  slack_id: string;
  name: string;
  smash_token: string;
};

export default class WorkspaceDataStore {
  private static readonly DATASTORE_NAME = "workspace";

  public static createWorkspace = async (
    client: SlackAPIClient,
    ws: Workspace,
  ) => {
    console.log("[WorkspaceDataStore.create]", ws);
    const ret = await client.apps.datastore.put({
      datastore: this.DATASTORE_NAME,
      item: ws,
    });
    if (!ret.ok) throw new Error(ret.error);
    return ret.ok;
  };

  public static getWorkspace = async (client: SlackAPIClient) => {
    console.log("[WorkspaceDataStore.getWorkspace]");
    const ret = await client.apps.datastore.query({
      datastore: this.DATASTORE_NAME,
    });
    if (!ret.ok) throw new Error(ret.error);
    return ret.items[0];
  };

  public static updateWorkspace = async (
    client: SlackAPIClient,
    ws: Workspace,
  ) => {
    console.log("[WorkspaceDataStore.updateWorkspace]", ws);
    const ret = await client.apps.datastore.update({
      datastore: this.DATASTORE_NAME,
      item: ws,
    });
    if (!ret.ok) throw new Error(ret.error);
    return ret.ok;
  };
}
