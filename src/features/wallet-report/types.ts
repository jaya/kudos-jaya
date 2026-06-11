export interface WalletReportParams {
  userId: string;
  teamId: string;
}

export interface WalletReportResult {
  success: boolean;
  message: string;
  fileUrl?: string;
}
