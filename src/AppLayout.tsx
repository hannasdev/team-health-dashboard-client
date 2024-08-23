import React, { useCallback } from 'react';
import { AppBar, Toolbar, Typography, Box, Link, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useIdleTimeout } from './hooks/useIdleTimeout';

interface IAppLayoutProps {
  children: React.ReactNode;
}

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

const PUBLIC_PAGES = ['Health Check'] as const;
const AUTHENTICATED_PAGES = ['Dashboard'] as const;
const UNAUTHENTICATED_PAGES = ['Register', 'Login'] as const;

const AppLayout: React.FC<IAppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  useIdleTimeout(IDLE_TIMEOUT, logout);

  const pages = [...PUBLIC_PAGES, ...(isLoggedIn ? AUTHENTICATED_PAGES : UNAUTHENTICATED_PAGES)];

  const handleNavigation = useCallback(
    (page: string) => {
      navigate(page === 'Dashboard' ? '/' : `/${page.toLowerCase().replace(' ', '')}`);
    },
    [navigate]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            <Link href="/" color="inherit" underline="none">
              Team Health Logo
            </Link>
          </Typography>
          <Box>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => {
                  handleNavigation(page);
                }}
                color="inherit"
                sx={{ margin: '0 8px' }}
                aria-label={`Navigate to ${page}`}
              >
                {page}
              </Button>
            ))}
            {isLoggedIn && (
              <Button onClick={logout} color="inherit" sx={{ margin: '0 8px' }} aria-label="Logout">
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
