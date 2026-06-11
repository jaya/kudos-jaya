export interface PrizesReportParams {
  userId: string;
  teamId: string;
  startDate: Date;
  endDate: Date;
}

export interface PrizesReportResult {
  success: boolean;
  message: string;
  fileUrl?: string;
}
