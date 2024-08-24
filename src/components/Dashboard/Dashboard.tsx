// src/components/Dashboard/Dashboard.tsx
import React from 'react';
import { Typography, Box, CircularProgress, Alert, Grid } from '@mui/material';
import { useMetricsData } from '../../hooks/useMetricsData';
import MetricChart from './MetricChart';

const Dashboard: React.FC = () => {
  const { metrics, loading, error, progress } = useMetricsData(90); // Default to 90 days

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <CircularProgress />
        {progress && (
          <Typography variant="body2" mt={2}>
            {progress.message} ({progress.progress}%)
          </Typography>
        )}
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading metrics: {error.message}</Alert>;
  }

  if (!metrics || metrics.length === 0) {
    return <Alert severity="info">No metrics data available.</Alert>;
  }

  // Group metrics by category
  const groupedMetrics = metrics.reduce<Record<string, typeof metrics>>((acc, metric) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!acc[metric.metric_category]) {
      acc[metric.metric_category] = [];
    }
    acc[metric.metric_category].push(metric);
    return acc;
  }, {});

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Team Health Dashboard
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
          <Grid item xs={12} md={6} key={category}>
            <MetricChart title={category} data={categoryMetrics} dataKey="value" color="#8884d8" />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
