// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalStyle from './styles/globalStyles';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

const queryClient = new QueryClient();

async function App() {
  try {
    await fetch('/health') // Vite will proxy this request to your backend
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  } catch (error) {
    console.error(error);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
