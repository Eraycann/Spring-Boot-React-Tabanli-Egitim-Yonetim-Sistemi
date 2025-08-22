import { Box, Typography, Paper } from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuthContext();

  return (
    <Box>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '2rem'
        }}
      >
        Dashboard
      </Typography>
      
      <Paper 
        elevation={0}
        sx={{
          padding: '3rem',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#64748b',
            fontWeight: 500,
            marginBottom: '1rem'
          }}
        >
          Hoş Geldiniz!
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#94a3b8',
            fontWeight: 400
          }}
        >
          Dashboard içeriği backend bağlantısı kurulduktan sonra eklenecektir.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DashboardPage;
