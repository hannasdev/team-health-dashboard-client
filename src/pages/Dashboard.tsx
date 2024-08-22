import React from 'react';
import { Typography, Box, Container } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        <Typography variant="body1">
          This is a placeholder for your dashboard content. You can start adding your team health
          metrics and visualizations here.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;
