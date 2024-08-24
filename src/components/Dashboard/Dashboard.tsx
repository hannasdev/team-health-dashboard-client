// src/components/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Grid } from '@mui/material';
import { useMetricsData } from '../../hooks/useMetricsData';
import MetricChart from './MetricChart';

const Dashboard: React.FC = () => {
  const [timePeriod] = useState(7);
  const { metrics, loading, error } = useMetricsData(timePeriod);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">Error loading metrics: {error.message}</Alert>;
  }

  if (!metrics) {
    return <Alert severity="info">No metrics data available.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Team Health Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MetricChart title="Commit Activity" data={metrics} dataKey="commits" color="#8884d8" />
        </Grid>
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Pull Requests"
            data={metrics}
            dataKey="pullRequests"
            color="#82ca9d"
          />
        </Grid>
        {/* Add more MetricChart components as needed */}
      </Grid>
    </Box>
  );
};

export default Dashboard;
