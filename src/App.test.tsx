// src/__ tests __/App.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('Renders the main page', async () => {
  render(<App />);

  // Wait for and assert on an element that should be present after any initial loading
  await waitFor(() => {
    expect(screen.getByText(/Team Health Logo/i)).toBeInTheDocument();
  });

  // Additional assertions can go here
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
});
