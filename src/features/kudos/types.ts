export interface CreateKudosRequest {
  fromId: string;
  toIds: string[];
  message: string;
  teamId: string;
  botToken: string;
  companyValues?: string;
}

export interface CreateKudosResult {
  id: string;
  success: boolean;
  toId: string;
}

export interface MonthlyKudosValidation {
  canGive: boolean;
  remaining?: number;
  message?: string;
}
