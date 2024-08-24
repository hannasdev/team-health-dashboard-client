// src/pages/Dashboard.tsx
import React from 'react';
import { Container } from '@mui/material';
import Dashboard from '../components/Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Dashboard />
    </Container>
  );
};

export default DashboardPage;
