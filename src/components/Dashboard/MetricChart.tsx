import React, { memo } from 'react';
import { Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MetricChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color: string;
}

const MetricChart: React.FC<MetricChartProps> = memo(({ title, data, dataKey, color }) => {
  return (
    <>
      <Typography variant="h6">{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={color} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
});

export default MetricChart;
