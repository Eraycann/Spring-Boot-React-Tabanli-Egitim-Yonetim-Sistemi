import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useAuthContext } from '../../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OAuth2 callback hata kontrolü
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      switch (error) {
        case 'email_not_found':
          setError('Bu e-posta adresi sistemde bulunamadı. Lütfen kayıt olun.');
          break;
        case 'user_not_registered':
          setError('Bu kullanıcı henüz kayıt olmamış. Lütfen önce kayıt olun.');
          break;
        default:
          setError('OAuth2 girişi sırasında bir hata oluştu.');
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      // Başarılı login sonrası ana sayfaya yönlendir
      navigate('/');
    } catch (err) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    loginWithGoogle();
  };

  return (
    <Box className="min-h-screen bg-gray-50 py-8 px-4">
      <Box className="max-w-md mx-auto">
        <Paper 
          elevation={0}
          className="p-8 rounded-lg border border-gray-200"
          sx={{ backgroundColor: '#ffffff' }}
        >
          <Box className="text-center mb-6">
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              Giriş Yap
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Hesabınıza erişmek için giriş yapın
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="E-posta"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Şifre"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              className="h-12"
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </Box>

          <Divider className="my-6">
            <Typography variant="body2" className="text-gray-500 px-2">
              veya
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            className="h-12 mb-6"
            sx={{
              borderColor: '#6b7280',
              color: '#374151',
              '&:hover': {
                borderColor: '#3b82f6',
                color: '#3b82f6',
              },
            }}
            startIcon={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
          >
            Google ile Giriş Yap
          </Button>

          <Box className="text-center">
            <Typography variant="body2" className="text-gray-600 mb-2">
              Hesabınız yok mu?
            </Typography>
            <Button
              variant="text"
              onClick={() => navigate('/register')}
              sx={{
                color: '#3b82f6',
                '&:hover': {
                  color: '#2563eb',
                },
              }}
            >
              Veli Kaydı Yap
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginForm;
