import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const OAuth2CallbackPage = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
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
          setLoading(false);
          return;
        }

        // Başarılı giriş durumunda ana sayfaya yönlendir
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');
        const email = urlParams.get('email');
        const role = urlParams.get('role');

        if (accessToken && refreshToken && email && role) {
          // Token'ları localStorage'a kaydet
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userRole', role);

          // State'i güncelle
          setIsAuthenticated(true);
          setUser({ email, role });

          // URL'den parametreleri temizle ve ana sayfaya yönlendir
          window.history.replaceState({}, document.title, '/');
          navigate('/');
        } else {
          setError('OAuth2 callback parametreleri eksik');
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || 'OAuth2 işlemi sırasında bir hata oluştu');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, setIsAuthenticated, setUser]);

  if (loading) {
    return (
      <Box className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <CircularProgress size={60} className="mb-4" />
        <Typography variant="h6" className="text-gray-600">
          Google ile giriş yapılıyor...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-gray-50">
        <Box className="max-w-md w-full p-6">
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Giriş Sayfasına Dön
          </button>
        </Box>
      </Box>
    );
  }

  return null;
};

export default OAuth2CallbackPage;
