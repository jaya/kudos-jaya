export interface Wallet {
  id: number;
  ownerId: string;
  teamId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: number;
  walletId: number;
  teamId: string;
  productId: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type DepositParams = {
  ownerId: string;
  teamId: string;
  amount: number;
};

export type WithdrawParams = {
  ownerId: string;
  teamId: string;
  amount: number;
};

export type GetBalanceParams = {
  ownerId: string;
  teamId: string;
};
