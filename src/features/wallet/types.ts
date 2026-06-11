export type BaseWalletParams = {
  ownerId: string;
  teamId: string;
  amount?: number;
};

export type WalletReportItem = {
  balance: number;
  name: string;
};
