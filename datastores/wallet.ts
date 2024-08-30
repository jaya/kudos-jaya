import { SlackAPIClient } from "deno-slack-api/types.ts";
import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const WalletDsDef = DefineDatastore({
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

export type Wallet = {
  id: string;
  owner_id: string;
  balance: number;
};

export type Deposit = {
  owner_id: string;
  amount: number;
};

export type WithDraw = Deposit;

type FindWalletParams = {
  id?: string;
  owner_id: string;
};

export default class WalletDataStore {
  private static readonly DATASTORE_NAME = "wallet";

  private static createWallet = async (
    client: SlackAPIClient,
    wallet: Wallet,
  ) => {
    console.log("[WalletDataStore.createWallet]", wallet);
    const ret = await client.apps.datastore.put({
      datastore: this.DATASTORE_NAME,
      item: wallet,
    });
    if (!ret.ok) throw new Error(ret.error);
    return ret.ok;
  };

  public static deposit = async (
    client: SlackAPIClient,
    deposit: Deposit,
  ): Promise<boolean> => {
    console.log("[WalletDataStore.deposit]", deposit);
    const wallet = await this.findWallet(client, {
      owner_id: deposit.owner_id,
    });

    if (!wallet) {
      const newWallet: Wallet = {
        id: crypto.randomUUID(),
        owner_id: deposit.owner_id,
        balance: deposit.amount,
      };
      await this.createWallet(client, newWallet);
      return true;
    }

    const increseadWallet: Wallet = {
      id: wallet.id,
      owner_id: wallet.owner_id,
      balance: wallet.balance + deposit.amount,
    };

    console.log("[WalletDataStore.increseadWallet]", increseadWallet);
    const ret = await client.apps.datastore.update({
      datastore: this.DATASTORE_NAME,
      item: increseadWallet,
    });
    if (!ret.ok) throw new Error(ret.error);
    return true;
  };

  private static findWallet = async (
    client: SlackAPIClient,
    params: FindWalletParams,
  ) => {
    const ret = await client.apps.datastore.query({
      datastore: this.DATASTORE_NAME,
      expression: "#owner_id = :owner_id",
      expression_attributes: { "#owner_id": "owner_id" },
      expression_values: { ":owner_id": params.owner_id },
    });
    return ret.items[0];
  };
}
