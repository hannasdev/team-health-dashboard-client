import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import { AuthenticationService } from '../../services/AuthenticationService/AuthenticationService';
import { LoggingService } from '../../services/LoggingService/LoggingService';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../services/AuthenticationService');
jest.mock('../../services/LocalStorageService');
jest.mock('../../services/ApiService');
jest.mock('../../services/LoggingService');

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const mockRegister = jest.fn().mockResolvedValue({});
    (AuthenticationService as jest.Mock).mockImplementation(() => ({
      register: mockRegister,
    }));

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
    (AuthenticationService as jest.Mock).mockImplementation(() => ({
      register: mockRegister,
    }));

    // Mock the error method of LoggingService
    (LoggingService.error as jest.Mock).mockImplementation(() => {});

    renderComponent();
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
      expect(LoggingService.error).toHaveBeenCalledWith('Registration error:', expect.any(Error));
    });
  });
});
