import React, { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Box, Link } from '@mui/material';

const pages = ['Dashboard', 'Register', 'Login', 'Health Check'];

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
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
              <Link
                key={page}
                href={`/${page.toLowerCase()}`} // Adjust routing if needed
                color="inherit"
                underline="none"
                sx={{ margin: '0 16px' }}
              >
                {page}
              </Link>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children} {/* This is where the page content will go */}
      </Box>
    </Box>
  );
};

export default AppLayout;
