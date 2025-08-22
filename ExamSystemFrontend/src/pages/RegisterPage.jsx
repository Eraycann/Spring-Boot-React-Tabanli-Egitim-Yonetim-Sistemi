import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import { apiService } from '../utils/apiService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    // Veli bilgileri
    email: '',
    password: '',
    parentFirstName: '',
    parentLastName: '',
    
    // Öğrenci bilgileri
    studentEmail: '',
    studentPassword: '',
    studentFirstName: '',
    studentLastName: '',
    gradeLevel: ''
  });

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
    setSuccess('');

    try {
      const response = await apiService.post('/auth/register-parent', formData);
      setSuccess('Veli ve öğrenci başarıyla kaydedildi! Giriş sayfasına yönlendiriliyorsunuz...');
      
      // 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Kayıt yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen bg-gray-50 py-8 px-4">
      <Box className="max-w-4xl mx-auto">
        <Paper 
          elevation={0}
          className="p-8 rounded-lg border border-gray-200"
          sx={{ backgroundColor: '#ffffff' }}
        >
          <Box className="text-center mb-8">
            <Typography 
              variant="h4" 
              className="font-bold text-gray-800 mb-2"
            >
              Veli Kaydı
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Kendinizi ve çocuğunuzu sisteme kaydedin
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              className="mb-6"
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              className="mb-6"
            >
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className="space-y-6">
            {/* Veli Bilgileri */}
            <Card 
              elevation={0}
              className="border border-gray-200"
              sx={{ backgroundColor: '#f8fafc' }}
            >
              <CardContent className="p-6">
                <Typography 
                  variant="h6" 
                  className="font-semibold text-gray-800 mb-4"
                >
                  Veli Bilgileri
                </Typography>
                
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    fullWidth
                    label="Veli Adı"
                    name="parentFirstName"
                    value={formData.parentFirstName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Veli Soyadı"
                    name="parentLastName"
                    value={formData.parentLastName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Veli E-posta"
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
                    label="Veli Şifre"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Öğrenci Bilgileri */}
            <Card 
              elevation={0}
              className="border border-gray-200"
              sx={{ backgroundColor: '#f0fdf4' }}
            >
              <CardContent className="p-6">
                <Typography 
                  variant="h6" 
                  className="font-semibold text-gray-800 mb-4"
                >
                  Öğrenci Bilgileri
                </Typography>
                
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    fullWidth
                    label="Öğrenci Adı"
                    name="studentFirstName"
                    value={formData.studentFirstName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Öğrenci Soyadı"
                    name="studentLastName"
                    value={formData.studentLastName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Öğrenci E-posta"
                    name="studentEmail"
                    type="email"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Öğrenci Şifre"
                    name="studentPassword"
                    type="password"
                    value={formData.studentPassword}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                  />
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Sınıf Seviyesi</InputLabel>
                    <Select
                      name="gradeLevel"
                      value={formData.gradeLevel}
                      onChange={handleChange}
                      label="Sınıf Seviyesi"
                      required
                    >
                      <MenuItem value={9}>9. Sınıf</MenuItem>
                      <MenuItem value={10}>10. Sınıf</MenuItem>
                      <MenuItem value={11}>11. Sınıf</MenuItem>
                      <MenuItem value={12}>12. Sınıf</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            <Box className="flex flex-col sm:flex-row gap-4 pt-4">
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
                  'Kayıt Ol'
                )}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/login')}
                className="h-12"
                sx={{
                  borderColor: '#6b7280',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                  },
                }}
              >
                Giriş Sayfasına Dön
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegisterPage;
