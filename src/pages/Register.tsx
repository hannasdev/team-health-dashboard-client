import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import RegisterForm from '../components/RegisterForm';

const Register: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <RegisterForm />
      </Box>
    </Container>
  );
};

export default Register;
