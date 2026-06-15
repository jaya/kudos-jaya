export interface Recognition {
  id: number;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  description: string;
  teamId: string;
  companyValues?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GiveKudosParams {
  toIds: string[];
  message: string;
  gif?: string;
  companyValues?: string[];
  fromId: string;
  teamId: string;
  botToken: string;
}

export interface GiveKudosResult {
  success: boolean;
  recognitionIds?: number[];
  message: string;
  id?: number;
}

export interface CancelKudosParams {
  recognitionIds: number[];
  teamId: string;
}

export interface RecognitionSummary {
  userId: string;
  recognitionCount: number;
}
