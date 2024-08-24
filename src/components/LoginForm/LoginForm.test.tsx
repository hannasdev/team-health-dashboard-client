// src/components/LoginForm/LoginForm.test.tsx

import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';
import { AuthenticationService } from '../../services/AuthenticationService/AuthenticationService';

jest.mock('../../services/AuthenticationService');

describe('LoginForm', () => {
  it('submits the form with valid inputs', async () => {
    const mockLogin = jest.fn().mockResolvedValue({});
    (AuthenticationService as jest.Mock).mockImplementation(() => ({
      login: mockLogin,
    }));

    const { getByLabelText, getByRole } = render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    fireEvent.change(getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  // Add more tests for error handling, validation, etc.
});
