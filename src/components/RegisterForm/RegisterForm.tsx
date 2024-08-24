import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { TextField, Button, Box, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { Link as MuiLink } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { LoggingService } from '../../services/LoggingService/LoggingService';

type RegisterInputs = {
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
  const { register: authRegister } = useAuth();

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    try {
      await authRegister(data.email, data.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
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
