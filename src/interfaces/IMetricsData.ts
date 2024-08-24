import type { IMetricData } from './IMetricData';

export interface IMetricsData {
  success: boolean;
  data: IMetricData[];
  errors: any[];
  githubStats: {
    totalPRs: number;
    fetchedPRs: number;
    timePeriod: number;
  };
  status: number;
}
