import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import { LoggingService } from '../../services/LoggingService/LoggingService';
import * as useAuthModule from '../../hooks/useAuth';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../services/LoggingService/LoggingService');
jest.mock('../../hooks/useAuth');

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthModule.useAuth as jest.Mock).mockReturnValue({
      register: jest.fn(),
      isLoggedIn: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

  it('renders register form', () => {
    renderComponent();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('displays error messages for invalid inputs', async () => {
    renderComponent();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password should be at least 12 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid inputs', async () => {
    const mockRegister = jest.fn().mockResolvedValue(true);
    (useAuthModule.useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoggedIn: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    renderComponent();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'ValidPassword123!');
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it('displays error message on registration failure', async () => {
    const mockRegister = jest.fn().mockRejectedValue(new Error('Registration failed'));
    (useAuthModule.useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoggedIn: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    renderComponent();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
      expect(LoggingService.error).toHaveBeenCalledWith('Registration error:', expect.any(Error));
    });
  });
});
