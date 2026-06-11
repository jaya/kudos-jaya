export interface CurrentSettingsResponse {
  giftCardApiTokenHint: string;
  defaultAmountHint: string;
  defaultChannelHint: string;
  alreadyInstalled: boolean;
  companyValuesHint: string;
  monthlyKudosLimitHint: string;
}

export interface SaveSettingsParams {
  teamId: string;
  userId: string;
  botToken: string;
  todoToken?: string;
  defaultChannelId?: string;
  defaultAmount?: number;
  companyValues?: string;
  monthlyKudosLimit?: number | null;
  auditorUserIds?: string[];
}
