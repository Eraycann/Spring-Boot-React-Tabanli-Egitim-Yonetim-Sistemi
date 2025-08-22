import { AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem, IconButton, Chip } from '@mui/material';
import { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Yönetici';
      case 'ROLE_TEACHER': return 'Öğretmen';
      case 'ROLE_STUDENT': return 'Öğrenci';
      case 'ROLE_PARENT': return 'Veli';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'error';
      case 'ROLE_TEACHER': return 'primary';
      case 'ROLE_STUDENT': return 'success';
      case 'ROLE_PARENT': return 'warning';
      default: return 'default';
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <Toolbar className="justify-between px-6">
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            fontSize: '1.25rem'
          }}
        >
          Lise Sınav Sistemi
        </Typography>

        <Box className="flex items-center space-x-4">
          <Box className="text-right mr-4">
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              {user?.email}
            </Typography>
            <Chip
              label={getRoleDisplayName(user?.role)}
              color={getRoleColor(user?.role)}
              size="small"
              sx={{ 
                height: 20,
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            />
          </Box>
          
          <IconButton
            onClick={handleMenu}
            sx={{
              padding: 0,
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s'
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              mt: 1,
              '& .MuiPaper-root': {
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            <MenuItem 
              onClick={handleClose}
              sx={{
                borderRadius: '8px',
                margin: '4px 8px',
                '&:hover': {
                  backgroundColor: '#f1f5f9'
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Profil
              </Typography>
            </MenuItem>
            
            <MenuItem 
              onClick={handleLogout}
              sx={{
                borderRadius: '8px',
                margin: '4px 8px',
                '&:hover': {
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 500 }}>
                Çıkış Yap
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
