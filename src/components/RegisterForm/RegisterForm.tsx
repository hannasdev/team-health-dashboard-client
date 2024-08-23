import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { TextField, Button, Box, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthenticationService } from '../../services/AuthenticationService';
import { LocalStorageService } from '../../services/LocalStorageService';
import { ApiService } from '../../services/ApiService';
import { Link as RouterLink } from 'react-router-dom';
import { Link as MuiLink } from '@mui/material';
import { LoggingService } from '../../services/LoggingService';
import { jwtDecode } from 'jwt-decode';

type RegisterInputs = {
  name: string;
  email: string;
  password: string;
};

const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const localStorageService = new LocalStorageService();
  const apiService = new ApiService(
    '/api',
    {
      handleError: (error) => {
        LoggingService.error('API Error:', error);
      },
    },
    {
      getToken: () => localStorageService.getItem('token'),
      setToken: (token) => {
        localStorageService.setItem('token', token);
      },
      refreshToken: async () => {
        LoggingService.log('Token refresh not implemented yet');
        return Promise.resolve('');
      },
    }
  );
  const authService = new AuthenticationService(
    apiService.getAxiosInstance(),
    localStorageService,
    jwtDecode,
    LoggingService
  );

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    try {
      // ! Not using name for now
      await authService.register(data.email, data.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data.message || 'Registration failed. Please try again.';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      LoggingService.error('Registration error:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Snackbar
        open={success}
        autoHideDuration={2000}
        message="Registration successful! Redirecting to dashboard..."
      />

      {/* <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        autoComplete="name"
        autoFocus
        {...register('name', {
          required: 'Name is required',
          minLength: { value: 2, message: 'Name must be at least 2 characters long' },
          maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
        })}
        error={!!errors.name}
        helperText={errors.name?.message}
      /> */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        autoComplete="email"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 12,
            message: 'Password should be at least 12 characters long for better security',
          },
          validate: (value) => {
            // Optional: Check if password contains a mix of characters
            const hasLowerCase = /[a-z]/.test(value);
            const hasUpperCase = /[A-Z]/.test(value);
            const hasNumber = /\d/.test(value);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            const characterTypesUsed = [
              hasLowerCase,
              hasUpperCase,
              hasNumber,
              hasSpecialChar,
            ].filter(Boolean).length;

            return (
              characterTypesUsed >= 3 ||
              'Consider using a mix of uppercase, lowercase, numbers, and special characters for a stronger password'
            );
          },
        })}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Register
      </Button>

      <Box mt={2} textAlign="center">
        <MuiLink component={RouterLink} to="/login">
          Already have an account? Sign in
        </MuiLink>
      </Box>
    </Box>
  );
};

export default RegisterForm;
