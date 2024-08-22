// src/components/AppLayout.tsx

import { AppBar, Toolbar, Typography, Box, Link, Button } from '@mui/material';
import type { IAppLayoutProps } from './interfaces';
import { useNavigate } from 'react-router-dom';
import { AuthenticationService } from './services/AuthenticationService';
import { ApiService } from './services/ApiService';
import { LocalStorageService } from './services/LocalStorageService';

const pages = ['Dashboard', 'Register', 'Login', 'Health Check'];

const AppLayout: React.FC<IAppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const localStorageService = new LocalStorageService();
  const apiService = new ApiService(
    '/api',
    {
      handleError: (error) => {
        console.error('API Error:', error);
      },
    },
    {
      getToken: () => localStorageService.getItem('token'),
      setToken: (token) => {
        localStorageService.setItem('token', token);
      },
      refreshToken: async () => {
        // Implement token refresh logic here
        return Promise.resolve('');
      },
    }
  );
  const authService = new AuthenticationService(apiService.getAxiosInstance(), localStorageService);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

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
                  navigate(`/${page.toLowerCase().replace(' ', '')}`);
                }}
                color="inherit"
                sx={{ margin: '0 16px' }}
              >
                {page}
              </Button>
            ))}
            <Button onClick={handleLogout} color="inherit" sx={{ margin: '0 16px' }}>
              Logout
            </Button>
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
