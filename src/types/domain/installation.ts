export interface Installation {
  id: string;
  teamId: string;
  teamName: string;
  botToken: string;
  giftCardApiToken?: string;
  defaultRecognitionChannel?: string;
  defaultAmount: number;
  companyValues?: string;
  monthlyKudosLimit?: number;
  auditorIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantConfig {
  teamId: string;
  monthlyKudosLimit: number;
  defaultAmount: number;
  defaultRecognitionChannel: string;
  companyValues?: string[];
}

export interface InstallationSettings {
  giftCardApiTokenHint: string;
  defaultAmountHint: string;
  defaultChannelHint: string;
  companyValuesHint: string;
  monthlyKudosLimitHint: string;
  alreadyInstalled: boolean;
}
