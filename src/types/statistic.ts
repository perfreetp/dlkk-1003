export interface WorkloadStat {
  doctorId: string;
  doctorName: string;
  department: string;
  statDate: string;
  studyCount: number;
  reportCount: number;
  auditCount: number;
  avgReportTime: number;
  avgAuditTime: number;
}

export interface EfficiencyData {
  date: string;
  reportCount: number;
  avgTime: number;
  passRate: number;
}
