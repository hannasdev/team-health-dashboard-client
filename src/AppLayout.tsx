import { AppBar, Toolbar, Typography, Box, Link } from '@mui/material';
import type { IAppLayoutProps } from './interfaces';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const pages = ['Dashboard', 'Register', 'Login', 'Health Check'];

const AppLayout: React.FC<IAppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

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
