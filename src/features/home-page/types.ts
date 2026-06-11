export interface HomePageParams {
  user: string;
  teamId: string;
  token: string;
}

export interface HomePageBlocksResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: any[];
  hasError: boolean;
  errorMessage?: string;
}
