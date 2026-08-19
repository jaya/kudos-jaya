export interface KudosViewState {
  toIds: string[];
  message: string;
  companyValues?: string;
  gif: string;
}

export interface KudosModalConfig {
  gif: string;
  companyValues?: string;
  maxSelectedItems?: number;
}
