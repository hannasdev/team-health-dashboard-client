export interface IMetricData {
  id: string;
  metric_category: string;
  metric_name: string;
  value: number;
  timestamp: string;
  unit: string;
  additional_info: string;
  source: string;
}
