// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import * as useAuthModule from './hooks/useAuth';
import * as useGlobalErrorHandlerModule from './hooks/useGlobalErrorHandler';
import * as useIdleTimeoutModule from './hooks/useIdleTimeout';
import {
  createMockUseAuth,
  createMockUseGlobalErrorHandler,
  createMockUseIdleTimeout,
} from './__mocks__/mockFactories';

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock react-query-devtools
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}));

// Mock the hooks
jest.mock('./hooks/useAuth');
jest.mock('./hooks/useGlobalErrorHandler');
jest.mock('./hooks/useIdleTimeout');

// Mock the lazy-loaded components
jest.mock('./pages/Dashboard', () => () => <div>Dashboard</div>);
jest.mock('./pages/Login', () => () => <div>Login</div>);
jest.mock('./pages/Register', () => () => <div>Register</div>);
jest.mock('./pages/HealthCheck', () => () => <div>Health Check</div>);
jest.mock('./pages/NotFound', () => () => <div>Not Found</div>);

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(ui, {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>,
  });
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthModule.useAuth as jest.Mock).mockImplementation(createMockUseAuth());
    (useGlobalErrorHandlerModule.useGlobalErrorHandler as jest.Mock).mockImplementation(
      createMockUseGlobalErrorHandler()
    );
    (useIdleTimeoutModule.useIdleTimeout as jest.Mock).mockImplementation(
      createMockUseIdleTimeout()
    );
  });

  it('Renders the main page for unauthenticated user', async () => {
    (useAuthModule.useAuth as jest.Mock).mockImplementation(createMockUseAuth(false));

    renderWithRouter(<App router={({ children }) => <>{children}</>} />);

    expect(await screen.findByText(/Team Health Logo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /health check/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dashboard/i })).not.toBeInTheDocument();
  });

  it('Renders the main page for authenticated user', async () => {
    (useAuthModule.useAuth as jest.Mock).mockImplementation(createMockUseAuth(true));

    renderWithRouter(<App router={({ children }) => <>{children}</>} />);

    expect(await screen.findByText(/Team Health Logo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /health check/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /register/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
  });
});
